import { Controller, Post, Body, Get, Param, BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('api/payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post('create')
    createOrder(@Body() body: { emails: string[]; planId: string; amount: number }) {
        if (!body.emails || body.emails.length === 0 || !body.planId || !body.amount) {
            throw new BadRequestException('Invalid order data');
        }
        return this.paymentService.createOrder(body.emails, body.planId, body.amount);
    }

    @Post('request-upgrade')
    createUpgradeRequest(@Body() body: { emails: string[]; planId: string; contactInfo: string; amount: number }) {
        if (!body.emails || body.emails.length === 0 || !body.planId || !body.contactInfo || !body.amount) {
            throw new BadRequestException('Invalid request data');
        }
        return this.paymentService.createUpgradeRequest(body.emails, body.planId, body.contactInfo, body.amount);
    }

    @Get('status/:code')
    async getOrderStatus(@Param('code') code: string) {
        const order = await this.paymentService.getOrder(code);
        if (!order) {
            throw new BadRequestException('Order not found');
        }
        return { status: order.status };
    }

    // Simulated Webhook from Sepay
    @Post('webhook')
    handleWebhook(@Body() body: { content: string; amount: number; transferAmount?: number }) {
        const amount = body.transferAmount || body.amount;
        const success = this.paymentService.processWebhook(body.content, amount);
        return { success };
    }
}
