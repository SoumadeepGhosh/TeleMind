import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import * as dotenv from 'dotenv';
import { RagModule } from '../rag/rag.module';
import { DocumentProcessor } from './document.processor';
import { DOCUMENT_QUEUE_NAME } from './queue.constants';

export * from './queue.constants';

dotenv.config();

function getRedisConnection() {
  const host = process.env.REDIS_HOST || 'localhost';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD || undefined;

  return {
    host,
    port,
    ...(password ? { password } : {}),
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
  ],
  providers: [DocumentProcessor],
  exports: [BullModule, DocumentProcessor],
})
export class QueueModule {}
