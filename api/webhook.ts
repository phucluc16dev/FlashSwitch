import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// These env vars should be set in Vercel project settings
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Must use Service Role to write if RLS is strict
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const data = req.body;

        // Log the incoming webhook for debugging
        console.log('Received webhook:', JSON.stringify(data));

        // SePay Webhook payload usually contains:
        // {
        //   "gateway": "Techcombank",
        //   "transactionDate": "2023-10-25 10:00:00",
        //   "accountNumber": "1903...",
        //   "subAccount": null,
        //   "transferType": "in",
        //   "transferAmount": 50000,
        //   "accumulated": 150000,
        //   "code": null,
        //   "content": "CK PRO123456",
        //   "referenceCode": "FT23...",
        //   "description": "Payment for order..."
        // }

        // Map to our DB schema
        const transaction = {
            gateway: data.gateway || 'SePay',
            transaction_date: data.transactionDate || new Date().toISOString(),
            account_number: data.accountNumber,
            sub_account: data.subAccount,
            amount_in: data.transferAmount || data.amount, // SePay might use different fields
            amount_out: 0,
            accumulated: data.accumulated,
            code: data.code,
            transaction_content: data.content || data.description,
            reference_number: data.referenceCode,
            body_msg: JSON.stringify(data),
        };

        const { error } = await supabase
            .from('sepay_transactions')
            .insert(transaction);

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to save transaction' });
        }

        return res.status(200).json({ success: true, message: 'Transaction logged' });
    } catch (err: any) {
        console.error('Webhook error:', err);
        return res.status(500).json({ error: err.message });
    }
}
