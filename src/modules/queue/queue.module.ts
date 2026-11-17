import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import * as dotenv from 'dotenv';
import { RagModule } from '../rag/rag.module';
import { DocumentProcessor } from './document.processor';
import { DOCUMENT_QUEUE_NAME } from './queue.constants';

export * from './queue.constants';

dotenv.config();

function getRedisConnection() {
  if (process.env.REDIS_URL) {
    try {
      const parsedUrl = new URL(process.env.REDIS_URL);
      return {
        host: parsedUrl.hostname,
        port: parseInt(parsedUrl.port || '6379', 10),
        username: parsedUrl.username ? decodeURIComponent(parsedUrl.username) : undefined,
        password: parsedUrl.password ? decodeURIComponent(parsedUrl.password) : undefined,
        tls: parsedUrl.protocol === 'rediss:' ? {} : undefined,
      };
    } catch {
      // Fall through
    }
  }

  const host = process.env.REDIS_HOST || 'localhost';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD || undefined;
  const isTls = host.includes('upstash.io') || process.env.REDIS_TLS === 'true';

  return {
    host,
    port,
    ...(password ? { password } : {}),
    ...(isTls ? { tls: {} } : {}),
  };
}

@Module({
  imports: [
    RagModule,
    BullModule.forRoot({
      connection: getRedisConnection(),
    }),
    BullModule.registerQueue({
      name: DOCUMENT_QUEUE_NAME,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    }),
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: DOCUMENT_QUEUE_NAME,
      adapter: BullMQAdapter,
    }),
  ],
  providers: [DocumentProcessor],
  exports: [BullModule, DocumentProcessor],
})
export class QueueModule {}
