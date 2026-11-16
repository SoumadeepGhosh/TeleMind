import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { AiModule } from '../ai/ai.module';
import { RagModule } from '../rag/rag.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [AiModule, RagModule, QueueModule],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
