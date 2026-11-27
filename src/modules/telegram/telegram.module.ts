import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { AiModule } from '../ai/ai.module';
import { RagModule } from '../rag/rag.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [AiModule, RagModule, QueueModule],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
