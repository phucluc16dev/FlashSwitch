import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { TelegramNotificationService } from './telegram.service';
import { SupabaseService } from './supabase.service';

@Module({
    controllers: [PaymentController],
    providers: [PaymentService, TelegramNotificationService, SupabaseService],
    exports: [PaymentService, SupabaseService],
})
export class PaymentModule { }
