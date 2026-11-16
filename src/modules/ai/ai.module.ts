import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { ConfigService } from '../../config/config.service';

@Module({
  providers: [AiService, ConfigService],
  exports: [AiService],
})
export class AiModule {}
