import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './modules/database/database.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { AiModule } from './modules/ai/ai.module';
import { RagModule } from './modules/rag/rag.module';
import { QueueModule } from './modules/queue/queue.module';
import { AuthModule } from './modules/auth/auth.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    TelegramModule,
    AiModule,
    RagModule,
    QueueModule,
    AuthModule,
    WhatsappModule,
    IntegrationsModule,
  ],
})
export class AppModule {}
