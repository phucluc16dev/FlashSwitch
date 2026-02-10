import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { logger } from '../../../utils/logger';
import { TelegramNotificationService } from './telegram.service';

export interface Order {
    code: string;
    emails: string[];
    planId: string;
    amount: number;
    status: 'PENDING' | 'PAID' | 'FAILED' | 'REQUESTED';
    createdAt: Date;
    contactInfo?: string; // New field for user contact
    type: 'PURCHASE' | 'UPGRADE_REQUEST';
}

import { SupabaseService } from './supabase.service';

@Injectable()
export class PaymentService implements OnModuleInit {
    private orders: Map<string, Order> = new Map();

    constructor(
        @Inject(TelegramNotificationService) private readonly telegramService: TelegramNotificationService,
        @Inject(SupabaseService) private readonly supabaseService: SupabaseService,
    ) { }

    onModuleInit() {
        this.supabaseService.onNewTransaction((transaction) => {
            // Map Supabase transaction fields to processWebhook expectations
            // transaction_content and amount_in
            const content = transaction.transaction_content || transaction.description || '';
            const amount = transaction.amount_in || transaction.amount || 0;

            this.processWebhook(content, Number(amount));
        });
    }

    createOrder(emails: string[], planId: string, amount: number): Order {
        // Generate a code: PRO + 6 digits
        const code = 'PRO' + Math.floor(100000 + Math.random() * 900000);

        const order: Order = {
            code,
            emails,
            planId,
            amount,
            status: 'PENDING',
            createdAt: new Date(),
            type: 'PURCHASE'
        };

        this.orders.set(code, order);
        logger.info(`[Payment] Created order ${code} for ${amount} VND`);
        return order;
    }

    createUpgradeRequest(emails: string[], planId: string, contactInfo: string, amount: number): Order {
        const code = 'REQ' + Math.floor(100000 + Math.random() * 900000); // REQ prefix for requests

        const order: Order = {
            code,
            emails,
            planId,
            amount,
            status: 'REQUESTED',
            createdAt: new Date(),
            contactInfo,
            type: 'UPGRADE_REQUEST'
        };

        this.orders.set(code, order);
        logger.info(`[Payment] Created upgrade request ${code} for ${contactInfo}`);

        // Send notification immediately
        this.telegramService.sendPurchaseNotification(order);

        return order;
    }

    async getOrder(code: string): Promise<Order | undefined> {
        let order = this.orders.get(code);

        if (!order) {
            // Context lost (server restart). Check Supabase.
            try {
                const tx = await this.supabaseService.findTransaction(code);
                if (tx) {
                    order = {
                        code,
                        emails: ['UNKNOWN (Server Restart)'],
                        planId: 'unknown',
                        amount: Number(tx.amount_in || tx.amount || 0),
                        status: 'PAID',
                        createdAt: new Date(tx.transaction_date || Date.now()),
                        type: 'PURCHASE',
                    };
                    // Restore to memory so we don't query every time
                    this.orders.set(code, order);

                    logger.info(`[Payment] Order ${code} recovered from Supabase (Context Lost)`);
                    await this.telegramService.sendPurchaseNotification(order);
                }
            } catch (e) {
                logger.error(`[Payment] Error recovering order ${code}`, e);
            }
        } else if (order.status === 'PENDING') {
            // Fallback: Check Supabase just in case we missed the webhook
            try {
                const tx = await this.supabaseService.findTransaction(code);
                if (tx) {
                    const amount = tx.amount_in || tx.amount || 0;
                    if (Number(amount) >= order.amount) {
                        order.status = 'PAID';
                        this.orders.set(code, order);
                        logger.info(`[Payment] Order ${code} matched via manual Supabase check`);
                        await this.telegramService.sendPurchaseNotification(order);
                    }
                }
            } catch (e) {
                logger.error(`[Payment] Error checking Supabase for ${code}`, e);
            }
        }
        return order;
    }

    async processWebhook(content: string, amount: number): Promise<boolean> {
        logger.info(`[Payment] Processing webhook: ${content} - ${amount}`);

        // Regex matching: Look for PRO followed by digits, insensitive, optional spaces
        // e.g., "PRO123456", "PRO 123456", "ck pro 123 456"
        // Since our code is "PRO" + 6 digits, we look for that pattern.
        const match = content.match(/PRO\s*(\d{6})/i);

        if (match) {
            // Construct the full code from the digits found + prefix
            // Actually, our stored code is "PRO123456". The regex might find "123456"
            // Let's normalize. 
            // If content has "PRO 123456", match[1] is 123456.
            const foundDigits = match[1];
            const normalizedCode = `PRO${foundDigits}`;

            const order = this.orders.get(normalizedCode);

            if (order && order.status === 'PENDING') {
                if (amount >= order.amount) {
                    order.status = 'PAID';
                    this.orders.set(normalizedCode, order);
                    logger.info(`[Payment] Order ${normalizedCode} marked as PAID via logic match`);

                    // Send Notification
                    await this.telegramService.sendPurchaseNotification(order);

                    return true;
                } else {
                    logger.warn(`[Payment] Amount mismatch for ${normalizedCode}. Expected ${order.amount}, got ${amount}`);
                }
            }
        }

        // Fallback: Check if any pending order code is directly included in the content string
        for (const [code, order] of this.orders.entries()) {
            if (order.status === 'PENDING' && content.toUpperCase().includes(code)) {
                if (amount >= order.amount) {
                    order.status = 'PAID';
                    this.orders.set(code, order);
                    logger.info(`[Payment] Order ${code} marked as PAID via direct string match`);

                    // Send Notification
                    await this.telegramService.sendPurchaseNotification(order);

                    return true;
                }
            }
        }
        return false;
    }
}
