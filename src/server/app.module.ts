import { Module } from '@nestjs/common';
import { ProxyModule } from './modules/proxy/proxy.module';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
  imports: [ProxyModule, PaymentModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
