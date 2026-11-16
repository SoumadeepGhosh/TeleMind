import { Module } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import { DatabaseModule } from './modules/database/database.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { AiModule } from './modules/ai/ai.module';
import { RagModule } from './modules/rag/rag.module';
import { QueueModule } from './modules/queue/queue.module';
import { AuthModule } from './modules/auth/auth.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';

@Module({
  imports: [
    DatabaseModule,
    TelegramModule,
    AiModule,
    RagModule,
    QueueModule,
    AuthModule,
    WhatsappModule,
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class AppModule {}
