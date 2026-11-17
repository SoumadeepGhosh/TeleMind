import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit');
import { AiService } from '../ai/ai.service';
import { RagService } from './rag.service';

export interface GeneratedStudyDoc {
  topic: string;
  fileName: string;
  pdfBuffer: Buffer;
  summaryText: string;
  indexedChunks: number;
  documentId: string;
}

@Injectable()
export class StudyService {
  private readonly logger = new Logger(StudyService.name);

  constructor(
    private readonly ai: AiService,
    private readonly rag: RagService,
  ) {}

  /**
   * 1. Performs live web search to gather real-time official context
   */
  async searchWebForTopic(topic: string): Promise<string> {
    this.logger.log(`🔍 Searching web for authoritative documentation on: "${topic}"...`);
    try {
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(
        topic + ' official documentation tutorial architecture guide',
      )}`;

      const res = await fetch(searchUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (!res.ok) {
        return `Authoritative topic overview on ${topic}.`;
      }

      const html = await res.text();
      const snippets: string[] = [];
      const snippetRegex = /<a class="result__snippet[^>]*>([\s\S]*?)<\/a>/gi;
      let match;
      while ((match = snippetRegex.exec(html)) !== null && snippets.length < 5) {
        const cleanSnippet = match[1]
          .replace(/<[^>]+>/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        if (cleanSnippet) {
          snippets.push(cleanSnippet);
        }
      }

      if (snippets.length === 0) {
        return `Comprehensive technical architecture and documentation for ${topic}.`;
      }

      return snippets.join('\n\n');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`⚠️ Web search fallback to knowledge base: ${msg}`);
      return `Detailed concepts, architecture, and official guidance for ${topic}.`;
    }
  }

  /**
   * 2. Synthesizes an exhaustive, professional technical guide using Groq 120B
   */
  async compileTechnicalGuide(topic: string, searchSnippets: string): Promise<string> {
    this.logger.log(`✍️ Compiling comprehensive Master Guide for: "${topic}"...`);

    const prompt =
      `You are a Principal Software Architect and author of technical whitepapers.\n` +
      `Write an exhaustive, data-loaded, production-grade Master Technical Reference on: "${topic}".\n\n` +
      `Web Research & Documentation Context:\n"""\n${searchSnippets}\n"""\n\n` +
      `STRICT FORMATTING RULES:\n` +
      `- DO NOT use any emojis or HTML tags (never use <br>, <b>, or special unicode symbols).\n` +
      `- Structure with clear numbered section headings (e.g. "1. Executive Architecture", "2. Core Mechanics").\n` +
      `- Include structured Markdown comparison tables with clear columns (| Feature | Details | Tradeoffs |).\n` +
      `- Include clear ASCII diagrams or code blocks where relevant.\n` +
      `- Write in-depth paragraphs packed with practical numbers, mathematical formulas, algorithms, latency metrics, and failure modes.\n\n` +
      `SECTIONS REQUIRED:\n` +
      `1. Executive Summary & Definitive Architecture\n` +
      `2. Data Flow & Component Interaction\n` +
      `3. Deep Mathematical & Algorithmic Foundations\n` +
      `4. Production Engineering, Latency & Scaling Trade-offs\n` +
      `5. Common Failure Modes, Anti-Patterns & Battle-Tested Solutions\n` +
      `6. Real-World Case Studies & Architectural Checklist\n\n` +
      `Make this an authoritative, publication-quality technical reference.`;

    return await this.ai.generateAnswer(prompt);
  }

  /**
   * Cleans text to 100% clean standard ASCII characters, stripping corrupting symbols
   */
  private cleanText(str: string): string {
    if (!str) return '';
    return str
      .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[—–]/g, ' - ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '') // Strict ASCII printable
      .trim();
  }

  /**
   * 3. Generates a publication-grade, beautifully styled PDF document
   */
  async createPdfBuffer(title: string, rawContent: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc: any = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 45, right: 45 },
        bufferPages: true,
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err: Error) => reject(err));

      const pageWidth = 505; // 595.28 - 90 margins
      const leftMargin = 45;

      // Cover Header Box
      doc.rect(leftMargin, 40, pageWidth, 55).fill('#0F172A'); // Deep Navy
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .fillColor('#FFFFFF')
        .text(this.cleanText(title), leftMargin + 15, 52, { width: pageWidth - 30 });

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#94A3B8')
        .text(
          `Published by Soumadeep AI Engineering • ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })} • Technical Reference Manual`,
          leftMargin + 15,
          77,
          { width: pageWidth - 30 },
        );

      doc.y = 110;

      const lines = rawContent.split('\n');
      let i = 0;

      while (i < lines.length) {
        const rawLine = lines[i];
        const trimmed = rawLine.trim();

        // 1. Skip empty lines
        if (!trimmed) {
          doc.moveDown(0.3);
          i++;
          continue;
        }

        // 2. Page Break Check
        if (doc.y > 740) {
          doc.addPage();
          doc.y = 50;
        }

        // 3. Section Headers (e.g. # Title, ## Section, or 1. Executive Summary)
        if (
          trimmed.startsWith('#') ||
          /^\d+\.\s+[A-Za-z]/.test(trimmed) ||
          /^\d+\.\d+\s+[A-Za-z]/.test(trimmed)
        ) {
          const isMainHeader =
            trimmed.startsWith('# ') || /^\d+\.\s+[A-Za-z]/.test(trimmed);
          const cleanHeader = this.cleanText(
            trimmed.replace(/^#+\s*/, ''),
          );

          doc.moveDown(0.8);
          if (doc.y > 720) {
            doc.addPage();
            doc.y = 50;
          }

          if (isMainHeader) {
            // Section Accent Bar
            const headerY = doc.y;
            doc.rect(leftMargin, headerY, 4, 18).fill('#2563EB'); // Royal Blue accent line
            doc
              .fontSize(13)
              .font('Helvetica-Bold')
              .fillColor('#0F172A')
              .text(cleanHeader, leftMargin + 12, headerY + 2);
            doc.moveDown(0.4);
            doc
              .strokeColor('#E2E8F0')
              .lineWidth(0.8)
              .moveTo(leftMargin, doc.y)
              .lineTo(leftMargin + pageWidth, doc.y)
              .stroke();
            doc.moveDown(0.4);
          } else {
            doc
              .fontSize(11)
              .font('Helvetica-Bold')
              .fillColor('#1E293B')
              .text(cleanHeader, leftMargin);
            doc.moveDown(0.2);
          }
          i++;
          continue;
        }

        // 4. Markdown Table Rendering
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          const tableLines: string[] = [];
          while (i < lines.length && lines[i].trim().startsWith('|')) {
            tableLines.push(lines[i].trim());
            i++;
          }

          // Parse rows
          const rows = tableLines
            .map((tl) =>
              tl
                .split('|')
                .slice(1, -1)
                .map((cell) => this.cleanText(cell)),
            )
            .filter((row) => !row.every((c) => /^[-:\s]+$/.test(c)));

          if (rows.length > 0) {
            const colCount = Math.max(...rows.map((r) => r.length));
            const colWidth = pageWidth / colCount;

            if (doc.y > 680) {
              doc.addPage();
              doc.y = 50;
            }

            doc.moveDown(0.4);

            for (let rIdx = 0; rIdx < rows.length; rIdx++) {
              const row = rows[rIdx];
              const isHeader = rIdx === 0;
              const rowY = doc.y;
              const cellHeight = 20;

              // Row background
              if (isHeader) {
                doc.rect(leftMargin, rowY, pageWidth, cellHeight).fill('#1E293B');
              } else if (rIdx % 2 === 1) {
                doc.rect(leftMargin, rowY, pageWidth, cellHeight).fill('#F8FAFC');
              } else {
                doc.rect(leftMargin, rowY, pageWidth, cellHeight).fill('#FFFFFF');
              }

              // Row borders
              doc
                .strokeColor('#E2E8F0')
                .lineWidth(0.5)
                .rect(leftMargin, rowY, pageWidth, cellHeight)
                .stroke();

              // Print cell texts
              for (let cIdx = 0; cIdx < colCount; cIdx++) {
                const text = row[cIdx] || '';
                const cellX = leftMargin + cIdx * colWidth;

                doc
                  .fontSize(isHeader ? 8.5 : 8)
                  .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
                  .fillColor(isHeader ? '#FFFFFF' : '#334155')
                  .text(text, cellX + 5, rowY + 5, {
                    width: colWidth - 10,
                    height: cellHeight - 6,
                    ellipsis: true,
                  });
              }

              doc.y = rowY + cellHeight;
              if (doc.y > 750) {
                doc.addPage();
                doc.y = 50;
              }
            }
            doc.moveDown(0.5);
          }
          continue;
        }

        // 5. Code / Diagram Block (lines starting with +--+, ```, or monospace indentation)
        if (
          trimmed.startsWith('```') ||
          trimmed.startsWith('+-') ||
          trimmed.startsWith('|') ||
          /^\s{4,}/.test(rawLine)
        ) {
          const codeLines: string[] = [];
          if (trimmed.startsWith('```')) {
            i++;
            while (i < lines.length && !lines[i].trim().startsWith('```')) {
              codeLines.push(this.cleanText(lines[i]));
              i++;
            }
            if (i < lines.length && lines[i].trim().startsWith('```')) i++;
          } else {
            while (
              i < lines.length &&
              (lines[i].trim().startsWith('+-') ||
                lines[i].trim().startsWith('|') ||
                /^\s{4,}/.test(lines[i]))
            ) {
              codeLines.push(this.cleanText(lines[i]));
              i++;
            }
          }

          if (codeLines.length > 0) {
            if (doc.y + codeLines.length * 11 > 740) {
              doc.addPage();
              doc.y = 50;
            }

            const boxHeight = Math.min(codeLines.length * 12 + 10, 300);
            const startY = doc.y;

            // Gray background box
            doc.rect(leftMargin, startY, pageWidth, boxHeight).fill('#F1F5F9');
            doc
              .strokeColor('#CBD5E1')
              .lineWidth(0.8)
              .rect(leftMargin, startY, pageWidth, boxHeight)
              .stroke();

            doc
              .fontSize(7.5)
              .font('Courier')
              .fillColor('#0F172A');

            let lineY = startY + 6;
            for (const cl of codeLines) {
              doc.text(cl, leftMargin + 10, lineY, { width: pageWidth - 20 });
              lineY += 12;
              if (lineY > startY + boxHeight - 8) break;
            }

            doc.y = startY + boxHeight + 6;
          }
          continue;
        }

        // 6. Blockquote / Callout box (lines starting with >)
        if (trimmed.startsWith('>')) {
          const quoteLines: string[] = [];
          while (i < lines.length && lines[i].trim().startsWith('>')) {
            quoteLines.push(this.cleanText(lines[i].replace(/^>\s*/, '')));
            i++;
          }

          const calloutText = quoteLines.join(' ');
          if (doc.y > 720) {
            doc.addPage();
            doc.y = 50;
          }

          const startY = doc.y;
          // Light background
          doc.rect(leftMargin, startY, pageWidth, 28).fill('#F8FAFC');
          // Blue left border line
          doc.rect(leftMargin, startY, 3, 28).fill('#3B82F6');

          doc
            .fontSize(8.5)
            .font('Helvetica-Oblique')
            .fillColor('#334155')
            .text(calloutText, leftMargin + 10, startY + 7, {
              width: pageWidth - 20,
            });

          doc.y = startY + 34;
          continue;
        }

        // 7. Bullet Points
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
          const bulletContent = this.cleanText(trimmed.replace(/^[-•*]\s*/, ''));
          doc
            .fontSize(9)
            .font('Helvetica')
            .fillColor('#1E293B')
            .text(`  •  ${bulletContent}`, leftMargin + 8, doc.y, {
              width: pageWidth - 16,
              lineGap: 3,
            });
          doc.moveDown(0.2);
          i++;
          continue;
        }

        // 8. Regular Body Paragraph
        const cleanParagraph = this.cleanText(trimmed);
        if (cleanParagraph) {
          doc
            .fontSize(9)
            .font('Helvetica')
            .fillColor('#334155')
            .text(cleanParagraph, leftMargin, doc.y, {
              width: pageWidth,
              align: 'justify',
              lineGap: 3,
            });
          doc.moveDown(0.3);
        }

        i++;
      }

      // Add Footer with Page Numbers
      const totalPages = doc.bufferedPageRange().count;
      for (let p = 0; p < totalPages; p++) {
        doc.switchToPage(p);
        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor('#94A3B8')
          .text(
            `Soumadeep AI • Technical Reference • Page ${p + 1} of ${totalPages}`,
            leftMargin,
            800,
            { align: 'center', width: pageWidth },
          );
      }

      doc.end();
    });
  }

  /**
   * 4. Orchestrates the complete pipeline:
   * Search -> Compile -> Generate PDF -> Auto-Index in pgvector
   */
  async researchAndIndexTopic(topic: string): Promise<GeneratedStudyDoc> {
    const cleanTopic = topic.trim();
    const sanitizedName = cleanTopic.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${sanitizedName}_Master_Guide.pdf`;

    // 1. Web research
    const snippets = await this.searchWebForTopic(cleanTopic);

    // 2. Compile comprehensive technical guide
    const guideContent = await this.compileTechnicalGuide(cleanTopic, snippets);

    // 3. Build publication-quality PDF buffer
    const pdfBuffer = await this.createPdfBuffer(
      `Master Technical Guide: ${cleanTopic}`,
      guideContent,
    );

    // 4. Auto-index directly into pgvector knowledge base
    this.logger.log(`📥 Auto-indexing generated guide "${fileName}" into pgvector...`);
    const indexResult = await this.rag.indexDocumentFromBuffer(
      fileName,
      'application/pdf',
      pdfBuffer,
    );

    return {
      topic: cleanTopic,
      fileName,
      pdfBuffer,
      summaryText: guideContent.slice(0, 400) + '...',
      indexedChunks: indexResult.chunkCount,
      documentId: indexResult.documentId,
    };
  }
}
