import { Module } from '@nestjs/common';
import { MikrotikController } from './mikrotik.controller.js';
import { MikrotikService } from './mikrotik.service.js';

@Module({
  controllers: [MikrotikController],
  providers: [MikrotikService],
})
export class MikrotikModule {}
