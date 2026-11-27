import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AiService } from '../ai/ai.service';

export interface SearchResult {
  id: string;
  content: string;
  title: string;
  similarity: number;
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  /**
   * Ingests a text note or document into PostgreSQL with pgvector embeddings
   */
  async indexTextDocument(
    title: string,
    text: string,
    mimeType = 'text/plain',
    fileSize?: number,
    organizationId?: string,
    uploadedById?: string,
  ): Promise<{ documentId: string; chunkCount: number }> {
    this.logger.log(`ðŸ“„ Ingesting document: "${title}" (${text.length} chars)`);

    // 1. Split text into chunks (~500 characters with simple sentence preservation)
    const chunks = this.chunkText(text, 500);

    const defaultKb = await this.prisma.knowledgeBase.findFirst({
      where: { slug: 'default' },
    });

    // 2. Create the parent Document record
    const doc = await this.prisma.document.create({
      data: {
        title,
        organizationId,
        uploadedById,
        knowledgeBaseId: defaultKb?.id,
        fileKey: `inline://${title.toLowerCase().replace(/\s+/g, '-')}`,
        fileSize: fileSize ?? Buffer.byteLength(text, 'utf-8'),
        mimeType,
        status: 'PROCESSING',
        totalChunks: chunks.length,
      },
    });

    // 3. Generate embeddings and save chunks with pgvector
    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];
      if (!chunkText) continue;

      const vector = await this.ai.generateEmbedding(chunkText);
      const vectorString = `[${vector.join(',')}]`;

      await this.prisma.$executeRaw`
        INSERT INTO document_chunks (id, "documentId", "chunkIndex", content, metadata, embedding, "createdAt")
        VALUES (
          uuid_generate_v4(), 
          ${doc.id}::uuid, 
          ${i}, 
          ${chunkText}, 
          '{}'::jsonb, 
          ${vectorString}::vector, 
          NOW()
        )
      `;
    }

    // 4. Mark document as INDEXED
    await this.prisma.document.update({
      where: { id: doc.id },
      data: { status: 'INDEXED' },
    });

    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'DOCUMENT_INDEXED',
          resource: 'Document',
          details: {
            documentId: doc.id,
            title,
            totalChunks: chunks.length,
            fileSize: fileSize ?? 0,
          },
        },
      });
    } catch {
      // Non-fatal
    }

    this.logger.log(`âœ… Successfully indexed "${title}" with ${chunks.length} vector chunks`);
    return { documentId: doc.id, chunkCount: chunks.length };
  }

  /**
   * Ingests a file buffer (PDF, TXT, MD, etc.) by extracting text and indexing chunks
   */
  async indexDocumentFromBuffer(
    fileName: string,
    mimeType: string,
    buffer: Buffer,
    organizationId?: string,
    uploadedById?: string,
  ): Promise<{ documentId: string; chunkCount: number }> {
    this.logger.log(
      `ðŸ“¥ Processing attached file: "${fileName}" (${mimeType}, ${buffer.length} bytes)`,
    );

    let extractedText = '';

    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') {
      try {
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text || '';
      } catch {
        throw new BadRequestException('Could not read this PDF. Check that it is a valid, text-based PDF.');
      }
    } else if (['txt', 'md', 'json', 'csv'].includes(extension || '')) {
      extractedText = buffer.toString('utf-8');
    } else {
      throw new BadRequestException('Unsupported file type. Choose a PDF, TXT, Markdown, CSV, or JSON file.');
    }

    const cleanText = extractedText.replace(/\r\n/g, '\n').trim();
    if (!cleanText || cleanText.length < 5) {
      throw new BadRequestException('Could not extract readable text. The file may be empty or an image scan.');
    }
    if (cleanText.length > 100_000) {
      throw new BadRequestException('Extracted file text exceeds the 100,000 character limit.');
    }

    return this.indexTextDocument(fileName, cleanText, mimeType, buffer.length, organizationId, uploadedById);
  }

  /**
   * Vector similarity search using pgvector cosine distance (<=>)
   */
  async searchKnowledge(query: string, limit = 3, organizationId?: string): Promise<SearchResult[]> {
    this.logger.log(`ðŸ” Searching knowledge base for: "${query}"`);

    // 1. Generate embedding for query text
    const queryVector = await this.ai.generateEmbedding(query);
    const vectorString = `[${queryVector.join(',')}]`;

    // 2. Execute cosine similarity query against document_chunks
    const results = organizationId
      ? await this.prisma.$queryRaw<SearchResult[]>`
      SELECT
        dc.id, 
        dc.content, 
        d.title, 
        (1 - (dc.embedding <=> ${vectorString}::vector))::float AS similarity
      FROM document_chunks dc
      JOIN documents d ON d.id = dc."documentId"
      WHERE d.status = 'INDEXED' AND d."organizationId" = ${organizationId}::uuid
      ORDER BY dc.embedding <=> ${vectorString}::vector
      LIMIT ${limit}
    `
      : await this.prisma.$queryRaw<SearchResult[]>`
      SELECT
        dc.id, dc.content, d.title,
        (1 - (dc.embedding <=> ${vectorString}::vector))::float AS similarity
      FROM document_chunks dc
      JOIN documents d ON d.id = dc."documentId"
      WHERE d.status = 'INDEXED'
      ORDER BY dc.embedding <=> ${vectorString}::vector
      LIMIT ${limit}
    `;

    return results;
  }

  /**
   * Answers a query grounded in your private knowledge documents with citations
   */
  async answerWithKnowledge(
    query: string,
    chatId?: string,
    organizationId?: string,
    preferredModel?: 'groq' | 'gemini',
  ): Promise<{ answer: string; sources: string[] }> {
    // 1. Retrieve the top relevant document chunks
    const matches = await this.searchKnowledge(query, 3, organizationId);

    if (matches.length === 0) {
      const fallbackAnswer = await this.ai.generateAnswer(query, undefined, chatId, preferredModel);
      return { answer: fallbackAnswer, sources: [] };
    }

    // 2. Assemble context with document titles
    const context = matches
      .map(
        (m, idx) =>
          `[Source ${idx + 1}: ${m.title} (Match: ${(m.similarity * 100).toFixed(1)}%)]\n${m.content}`,
      )
      .join('\n\n---\n\n');

    // 3. Ask AI with context AND chatId for conversational continuity
    const answer = await this.ai.generateAnswer(query, context, chatId, preferredModel);
    const sources = matches.map((m) => `${m.title} (${(m.similarity * 100).toFixed(0)}% match)`);

    return { answer, sources };
  }

  /**
   * Retrieves all indexed documents from the database
   */
  async listDocuments(organizationId?: string) {
    return this.prisma.document.findMany({
      ...(organizationId ? { where: { organizationId } } : {}),
      select: {
        id: true,
        title: true,
        mimeType: true,
        totalChunks: true,
        fileSize: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  /**
   * Deletes a document by title, partial title, index number, or ID, cascade-deleting all associated vector chunks
   */
  async deleteDocument(titleOrId: string, organizationId?: string): Promise<{ deleted: boolean; title: string }> {
    const trimmed = titleOrId.trim();

    // 1. If user passed a number (e.g. "1"), delete by index from recent documents
    if (/^\d+$/.test(trimmed)) {
      const index = parseInt(trimmed, 10) - 1;
      const docs = await this.listDocuments(organizationId);
      if (index >= 0 && index < docs.length) {
        const targetDoc = docs[index];
        await this.prisma.document.delete({ where: { id: targetDoc.id, ...(organizationId ? { organizationId } : {}) } });
        this.logger.log(`ðŸ—‘ï¸ Deleted document #${trimmed} "${targetDoc.title}"`);
        return { deleted: true, title: targetDoc.title };
      }
    }

    // 2. Find document by ID, exact title, or partial title (case-insensitive)
    let doc = await this.prisma.document.findFirst({
      where: {
        ...(organizationId ? { organizationId } : {}),
        OR: [
          { id: trimmed.length === 36 ? trimmed : undefined },
          { title: { equals: trimmed, mode: 'insensitive' } },
          { title: { contains: trimmed, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!doc) {
      return { deleted: false, title: trimmed };
    }

    // 3. Delete parent document (PostgreSQL cascade-deletes all vector chunks)
    await this.prisma.document.delete({
      where: { id: doc.id },
    });

    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'DOCUMENT_DELETED',
          resource: 'Document',
          details: { documentId: doc.id, title: doc.title },
        },
      });
    } catch {
      // Non-fatal
    }

    this.logger.log(`ðŸ—‘ï¸ Deleted document "${doc.title}" and its vector chunks`);
    return { deleted: true, title: doc.title };
  }

  /**
   * Simple text chunker
   */
  private chunkText(text: string, chunkSize = 800, overlap = 150): string[] {
    const chunks: string[] = [];
    let startIndex = 0;
    while (startIndex < text.length) {
      const endIndex = Math.min(startIndex + chunkSize, text.length);
      const chunk = text.slice(startIndex, endIndex).trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }
      // Move forward by (chunkSize - overlap)
      startIndex += chunkSize - overlap;
    }
    return chunks;
  }
}
