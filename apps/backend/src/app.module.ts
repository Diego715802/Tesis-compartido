import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { MikrotikModule } from './mikrotik/mikrotik.module.js';

@Module({
  imports: [MikrotikModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
