import { Injectable } from '@nestjs/common';
import { logger } from '../../../utils/logger';

@Injectable()
export class TelegramNotificationService {
    // Config from environment variables
    private readonly BOT_TOKEN: string;
    private readonly CHAT_ID: string;

    constructor() {
        // Force load .env from process.cwd() (project root)
        try {
            require('dotenv').config({ path: require('path').join(process.cwd(), '.env') });
        } catch (e) {
            logger.warn('[Telegram] Failed to load .env file', e);
        }

        this.BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7675261846:AAHvxGNDRuzD4ikT8CTMtEUpakbal-ubEWQ';
        this.CHAT_ID = process.env.TELEGRAM_CHAT_ID || '7810649476';

        logger.info(`[Telegram] Initialized with Token: ${this.BOT_TOKEN ? this.BOT_TOKEN.substring(0, 10) + '...' : 'MISSING'} | ChatID: ${this.CHAT_ID}`);
    }

    async sendPurchaseNotification(order: {
        code: string;
        amount: number;
        emails: string[];
        planId: string;
        createdAt: Date;
        contactInfo?: string;
        type?: 'PURCHASE' | 'UPGRADE_REQUEST';
    }): Promise<void> {
        if (!this.BOT_TOKEN || this.BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
            logger.warn('[Telegram] Bot token not configured. Skipping notification.');
            return;
        }

        const isRequest = order.type === 'UPGRADE_REQUEST';
        const title = isRequest ? '🚀 <b>New Upgrade Request!</b>' : '🎉 <b>New Google Pro Purchase!</b>';
        const contactLine = order.contactInfo ? `☎️ <b>Contact:</b> ${order.contactInfo}\n` : '';

        const message = `
${title}

💰 <b>Amount:</b> ${order.amount.toLocaleString('vi-VN')} VND
📦 <b>Plan:</b> ${order.planId}
🏷️ <b>Code:</b> ${order.code}
${contactLine}
📧 <b>Emails:</b>
${order.emails.map((e) => `- ${e}`).join('\n')}

⏰ <b>Time:</b> ${order.createdAt.toLocaleString('vi-VN')}
    `.trim();

        try {
            const url = `https://api.telegram.org/bot${this.BOT_TOKEN}/sendMessage`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: this.CHAT_ID,
                    text: message,
                    parse_mode: 'HTML',
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                logger.error(`[Telegram] Failed to send notification: ${errorText}`);
            } else {
                logger.info(`[Telegram] Notification sent for order ${order.code}`);
            }
        } catch (error) {
            logger.error('[Telegram] Error sending notification', error);
        }
    }
}
