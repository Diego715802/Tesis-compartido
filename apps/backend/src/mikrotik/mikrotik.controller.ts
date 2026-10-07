import { Controller, Get } from '@nestjs/common';
import { MikrotikService } from './mikrotik.service.js';

@Controller('mikrotik')
export class MikrotikController {
  constructor(private readonly mikrotikService: MikrotikService) {}

  @Get('telemetry')
  getTelemetry() {
    return this.mikrotikService.getTelemetry();
  }
}
