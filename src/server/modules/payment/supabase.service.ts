import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../../../utils/logger';

@Injectable()
export class SupabaseService implements OnModuleInit {
    private supabase!: SupabaseClient;

    constructor() {
        // These should ideally come from ConfigService
        // For now, we'll read from process.env which Electron passes or .env file
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey) {
            this.supabase = createClient(supabaseUrl, supabaseKey);
            logger.info('[Supabase] Client initialized');
        } else {
            logger.warn('[Supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY. realtime features disabled.');
        }
    }

    onModuleInit() {
        if (this.supabase) {
            this.subscribeToTransactions();
        }
    }

    // Event emitter or callback mechanism could be used here.
    // For simplicity, we'll expose a method to register a callback.
    private onTransactionCallbacks: ((payload: any) => void)[] = [];

    public onNewTransaction(callback: (payload: any) => void) {
        this.onTransactionCallbacks.push(callback);
    }

    private subscribeToTransactions() {
        if (!this.supabase) return;

        this.supabase
            .channel('sepay_transactions')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'sepay_transactions' },
                (payload) => {
                    const newTransaction = payload.new;
                    logger.info('[Supabase] New transaction received:', newTransaction);
                    this.notifyListeners(newTransaction);
                }
            )
            .subscribe((status) => {
                logger.info(`[Supabase] Subscription status: ${status}`);
            });
    }

    public async findTransaction(content: string): Promise<any> {
        if (!this.supabase) return null;

        // Search for transaction content containing the code (content string)
        // SePay content: "PRO123456"
        const { data, error } = await this.supabase
            .from('sepay_transactions')
            .select('*')
            .ilike('transaction_content', `%${content}%`)
            .order('transaction_date', { ascending: false })
            .limit(1);

        if (error) {
            logger.error('[Supabase] Find transaction error:', error);
            return null;
        }

        return data && data.length > 0 ? data[0] : null;
    }

    private notifyListeners(transaction: any) {
        this.onTransactionCallbacks.forEach(cb => cb(transaction));
    }
}
