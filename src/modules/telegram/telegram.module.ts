import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { ConfigService } from '../../config/config.service';
import { AiModule } from '../ai/ai.module';
import { RagModule } from '../rag/rag.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [AiModule, RagModule, QueueModule],
  providers: [TelegramService, ConfigService],
  exports: [TelegramService],
})
export class TelegramModule {}
