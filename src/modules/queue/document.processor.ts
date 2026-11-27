import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { RagService } from '../rag/rag.service';
import { DOCUMENT_QUEUE_NAME } from './queue.constants';

export interface DocumentJobData {
  fileName: string;
  mimeType: string;
  bufferBase64: string;
  source: 'telegram' | 'whatsapp';
  senderId: string;
  organizationId?: string;
}

@Processor(DOCUMENT_QUEUE_NAME)
export class DocumentProcessor extends WorkerHost {
  private readonly logger = new Logger(DocumentProcessor.name);

  constructor(private readonly rag: RagService) {
    super();
  }

  async process(job: Job<DocumentJobData>): Promise<{ documentId: string; chunkCount: number }> {
    const { fileName, mimeType, bufferBase64, senderId, organizationId } = job.data;
    if (!organizationId) throw new Error('Refusing to index a channel document without a workspace owner.');
    this.logger.log(`⚙️ [BullMQ Worker] Processing job #${job.id}: "${fileName}" from ${senderId}`);

    const buffer = Buffer.from(bufferBase64, 'base64');

    // Heavy lifting: text extraction, chunking, and pgvector embeddings
    const result = await this.rag.indexDocumentFromBuffer(fileName, mimeType, buffer, organizationId);

    this.logger.log(
      `✅ [BullMQ Worker] Finished job #${job.id}: Indexed ${result.chunkCount} chunks into PostgreSQL!`,
    );

    return result;
  }
}
