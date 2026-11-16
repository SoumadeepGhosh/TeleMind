import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { ConfigService } from '../../config/config.service';
import { AiService } from '../ai/ai.service';
import { RagService } from '../rag/rag.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DOCUMENT_QUEUE_NAME } from '../queue/queue.module';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private bot!: Telegraf;

  constructor(
    private readonly config: ConfigService,
    private readonly ai: AiService,
    private readonly rag: RagService,
    @InjectQueue(DOCUMENT_QUEUE_NAME) private readonly docQueue: Queue,
  ) {}

  async onModuleInit(): Promise<void> {
    const token = this.config.telegramToken;

    if (!token) {
      this.logger.warn('⚠️ TELEGRAM_BOT_TOKEN is not set in .env. Bot will not start.');
      return;
    }

    // 1. Initialize Telegraf bot instance
    this.bot = new Telegraf(token);

    // 2. Register global error handler
    this.bot.catch((err, ctx) => {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`⚠️ Telegram Bot error for update ${ctx?.update?.update_id}: ${errorMsg}`);
    });

    // 3. Register command & message handlers
    this.registerHandlers();

    // 4. Verify connection with Telegram and launch polling
    try {
      const botInfo = await this.bot.telegram.getMe();
      this.logger.log(`🤖 Telegram Bot connected: @${botInfo.username} (${botInfo.first_name})`);

      void this.bot.launch();
      this.logger.log('📡 Bot is actively listening for messages in Telegram!');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to connect Telegram Bot: ${errorMsg}`);
    }
  }

  private registerHandlers(): void {
    // Command: /start
    this.bot.start((ctx) => {
      const userName = ctx.from.first_name || 'Friend';
      this.logger.log(`📥 Received /start from @${ctx.from.username || ctx.from.id} (${userName})`);

      return ctx.reply(
        `👋 Hello ${userName}!\n\n` +
          `I am *Soumadeep AI*, your personal AI Knowledge and Voice Assistant powered by *Groq 120B* and *PostgreSQL pgvector*.\n\n` +
          `✨ *What you can do:*\n` +
          `• 🎙️ *Send a Voice Note* — I will transcribe your voice and speak back to you with audio!\n` +
          `• 📎 *Attach any PDF or text file* — I will index it into my vector knowledge base\n` +
          `• \`/ask <question>\` - Search private knowledge & answer with citations\n` +
          `• \`/listdocs\` - View all indexed documents\n` +
          `• \`/clear\` - Reset conversation memory\n` +
          `• Send any text to chat naturally!`,
        { parse_mode: 'Markdown' },
      );
    });

    // Command: /help
    this.bot.help((ctx) => {
      this.logger.log(`📥 Received /help from @${ctx.from.username || ctx.from.id}`);
      return ctx.reply(
        `📖 *Soumadeep AI Command Guide*\n\n` +
          `• 🎙️ *Send Voice Note*: Transcribes voice & replies with speech audio\n` +
          `• 📎 *Attach PDF or TXT*: Ingests full document into vector database\n` +
          `• \`/ask <query>\` - Search private knowledge & answer with citations\n` +
          `• \`/addnote <Title> | <Content>\` - Index a quick text note into vector database\n` +
          `• \`/listdocs\` - List all stored documents & vector chunks\n` +
          `• \`/deletedoc <Title>\` - Delete document and purge vector chunks\n` +
          `• \`/clear\` - Reset chat memory and start fresh\n` +
          `• \`/start\` - Restart assistant\n` +
          `• Send any text to chat directly!`,
        { parse_mode: 'Markdown' },
      );
    });
    // Command: /clear - Reset conversation memory
    this.bot.command('clear', async (ctx) => {
      this.ai.clearHistory(String(ctx.chat.id));
      this.logger.log(`🧹 Conversation memory cleared for @${ctx.from.username || ctx.from.id}`);
      return ctx.reply('🧹 *Conversation memory cleared!* Starting a fresh chat session.', {
        parse_mode: 'Markdown',
      });
    });

    // Command: /listdocs - List all indexed documents in PostgreSQL
    this.bot.command('listdocs', async (ctx) => {
      await ctx.sendChatAction('typing');

      try {
        const docs = await this.rag.listDocuments();

        if (docs.length === 0) {
          return ctx.reply(
            '📂 Your knowledge base is empty! Upload a PDF or add a note with `/addnote`.',
            {
              parse_mode: 'Markdown',
            },
          );
        }

        const docLines = docs.map((d, index) => {
          const sizeKb = (d.fileSize / 1024).toFixed(1);
          const dateStr = new Date(d.createdAt).toLocaleDateString();
          return `${index + 1}. *${d.title}*\n   📊 ${d.totalChunks} chunks | 📦 ${sizeKb} KB | 📅 ${dateStr}\n   🆔 \`${d.id}\``;
        });

        const reply = `📚 *Indexed Knowledge Documents (${docs.length}):*\n\n${docLines.join('\n\n')}\n\n💡 *Tip:* Use \`/deletedoc <Title or ID>\` to delete any document.`;

        return await this.safeReply(ctx, reply);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.logger.error(`Error listing docs: ${errorMsg}`);
        return ctx.reply(`❌ Failed to list documents: ${errorMsg}`);
      }
    });

    // Command: /deletedoc <title or id>
    this.bot.command('deletedoc', async (ctx) => {
      const target = ctx.message.text.replace(/^\/deletedoc\s*/i, '').trim();

      if (!target) {
        return ctx.reply(
          '⚠️ Please provide the title or ID of the document to delete.\n\n*Example:*\n`/deletedoc Soumadeep_Ghosh-Resume.pdf`',
          {
            parse_mode: 'Markdown',
          },
        );
      }

      await ctx.sendChatAction('typing');

      try {
        const result = await this.rag.deleteDocument(target);

        if (!result.deleted) {
          return ctx.reply(
            `⚠️ Document not found: "${target}". Use \`/listdocs\` to view available documents.`,
            {
              parse_mode: 'Markdown',
            },
          );
        }

        return ctx.reply(
          `🗑️ *Document Deleted Successfully:*\n"${result.title}" and all its vector chunks have been removed from PostgreSQL.`,
          {
            parse_mode: 'Markdown',
          },
        );
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.logger.error(`Error deleting doc: ${errorMsg}`);
        return ctx.reply(`❌ Failed to delete document: ${errorMsg}`);
      }
    });

    // Command: /addnote <Title> | <Content>
    this.bot.command('addnote', async (ctx) => {
      const fullText = ctx.message.text.replace(/^\/addnote\s*/i, '').trim();
      const parts = fullText.split('|');

      if (parts.length < 2 || !parts[0]?.trim() || !parts[1]?.trim()) {
        return ctx.reply(
          `⚠️ *Invalid format!* Please separate title and content with a pipe \`|\`:\n\n` +
            `*Example:*\n\`/addnote Refund Policy | Customers can request full refunds within 30 days.\``,
          { parse_mode: 'Markdown' },
        );
      }

      const title = parts[0].trim();
      const content = parts.slice(1).join('|').trim();

      await ctx.sendChatAction('typing');
      const waitMsg = await ctx.reply(
        `⏳ Converting "${title}" to AI vector embeddings & saving to PostgreSQL...`,
      );

      try {
        const result = await this.rag.indexTextDocument(title, content);
        return await this.safeReply(
          ctx,
          `✅ *Document Indexed Successfully!*\n\n` +
            `📁 *Title:* ${title}\n` +
            `🔢 *Vector Chunks:* ${result.chunkCount} chunks (768 dimensions)\n` +
            `💾 *Database:* Stored in PostgreSQL \`pgvector\`\n\n` +
            `You can now ask questions about it using \`/ask\`!`,
        );
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.logger.error(`Error indexing note: ${errorMsg}`);
        return ctx.reply(`❌ Failed to index document: ${errorMsg}`);
      }
    });

    // Command: /ask <query> - Grounded RAG Search
    this.bot.command('ask', async (ctx) => {
      const query = ctx.message.text.replace(/^\/ask\s*/i, '').trim();

      if (!query) {
        return ctx.reply(
          `⚠️ Please provide a question after \`/ask\`.\n\n*Example:*\n\`/ask What is the refund policy?\``,
          { parse_mode: 'Markdown' },
        );
      }

      const user = `@${ctx.from.username || ctx.from.id}`;
      this.logger.log(`🔎 [RAG Search] Query from ${user}: "${query}"`);
      await ctx.sendChatAction('typing');

      try {
        const { answer, sources } = await this.rag.answerWithKnowledge(query, String(ctx.chat.id));

        let replyMessage = answer;
        if (sources.length > 0) {
          replyMessage += `\n\n📚 Sources Cited:\n${sources.map((s) => `• ${s}`).join('\n')}`;
        }

        return await this.safeReply(ctx, replyMessage);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.logger.error(`RAG Search error: ${errorMsg}`);
        return ctx.reply(`❌ Error querying knowledge base: ${errorMsg}`);
      }
    });

    // Document File Uploads (PDF, TXT, Markdown, CSV, JSON)
    this.bot.on('document', async (ctx) => {
      const doc = ctx.message.document;
      const fileName = doc.file_name || 'uploaded_document';
      const mimeType = doc.mime_type || 'application/octet-stream';
      const user = `@${ctx.from.username || ctx.from.id}`;

      this.logger.log(
        `📎 Received document upload from ${user}: "${fileName}" (${mimeType}, ${doc.file_size} bytes)`,
      );

      // File size limit: 10MB
      const MAX_SIZE = 10 * 1024 * 1024;
      if (doc.file_size && doc.file_size > MAX_SIZE) {
        return ctx.reply('⚠️ File is too large! Please upload a file under 10MB.');
      }

      await ctx.sendChatAction('upload_document');
      await ctx.reply(
        `⏳ Received *${fileName}*!\n\nExtracting document content and generating AI vector embeddings for PostgreSQL...`,
        { parse_mode: 'Markdown' },
      );

      try {
        // 1. Fetch file download link from Telegram
        const fileLink = await ctx.telegram.getFileLink(doc.file_id);

        // 2. Download the file into memory
        const response = await fetch(fileLink.href);
        if (!response.ok) {
          throw new Error(`Failed to download file from Telegram: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 3. Offload document indexing to BullMQ background queue
        const user = `@${ctx.from.username || ctx.from.id}`;
        const job = await this.docQueue.add('index-document', {
          fileName,
          mimeType,
          bufferBase64: buffer.toString('base64'),
          source: 'telegram',
          senderId: user,
        });

        this.logger.log(`📥 Added document "${fileName}" to BullMQ Queue (Job ID: ${job.id})`);

        return await this.safeReply(
          ctx,
          `⚡ *Document Queued in Background! (Job #${job.id})*\n\n` +
            `📄 *File:* \`${fileName}\`\n` +
            `⚙️ *Status:* BullMQ worker is parsing & embedding into PostgreSQL \`pgvector\`...\n\n` +
            `You can query it using \`/ask <question>\` in just a few seconds!`,
        );
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.logger.error(`Error processing uploaded document: ${errorMsg}`);
        return ctx.reply(`❌ Failed to process document: ${errorMsg}`);
      }
    });

    // Voice Message Handler (Speech-to-Text via Groq Whisper & Voice Reply)
    this.bot.on('voice', async (ctx) => {
      const voice = ctx.message.voice;
      const user = `@${ctx.from.username || ctx.from.id}`;
      this.logger.log(`🎙️ Received voice note from ${user} (${voice.duration}s)`);

      await ctx.sendChatAction('record_voice');

      try {
        const fileLink = await ctx.telegram.getFileLink(voice.file_id);
        const res = await fetch(fileLink.href);
        const arrayBuf = await res.arrayBuffer();
        const audioBuffer = Buffer.from(arrayBuf);

        // Transcribe voice with Groq Whisper
        const transcription = await this.ai.transcribeAudio(audioBuffer, 'audio/ogg');
        this.logger.log(`📝 Transcribed Telegram voice from ${user}: "${transcription}"`);

        // Generate response with Soumadeep AI (Groq 120B)
        const answer = await this.ai.generateAnswer(transcription, undefined, String(ctx.chat.id));

        // Generate speech audio reply
        try {
          const speechBase64 = await this.ai.generateSpeechAudio(answer);
          await ctx.replyWithVoice(
            { source: Buffer.from(speechBase64, 'base64') },
            { caption: `🤖 *Soumadeep AI:*\n${answer}`, parse_mode: 'Markdown' },
          );
        } catch {
          // Fallback to text if audio reply generation fails
          await ctx.reply(`🎙️ *You said:* "${transcription}"\n\n🤖 *Soumadeep AI:*\n${answer}`, {
            parse_mode: 'Markdown',
          });
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.logger.error(`Error processing Telegram voice note: ${errorMsg}`);
        await ctx.reply(`❌ Could not process voice message: ${errorMsg}`);
      }
    });

    // Generic text messages -> AI Chat
    this.bot.on('text', async (ctx) => {
      const text = ctx.message.text;

      // Ignore other bot commands that start with /
      if (text.startsWith('/')) {
        return;
      }

      const user = `@${ctx.from.username || ctx.from.id}`;
      this.logger.log(`💬 Processing AI query from ${user}: "${text}"`);
      await ctx.sendChatAction('typing');

      try {
        const answer = await this.ai.generateAnswer(text, undefined, String(ctx.chat.id));
        this.logger.log(`✅ AI answered ${user} successfully`);

        if (answer.length > 4000) {
          for (let i = 0; i < answer.length; i += 4000) {
            await ctx.reply(answer.substring(i, i + 4000));
          }
        } else {
          await ctx.reply(answer);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.logger.error(`Error answering query for ${user}: ${errorMsg}`);
        await ctx.reply(`❌ Sorry, I had trouble generating an answer: ${errorMsg}`);
      }
    });
  }

  /**
   * Helper that sends a message formatted with Markdown, falling back to plain text
   * if Telegram fails to parse unescaped characters (e.g. underscores in filenames).
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async safeReply(ctx: any, text: string): Promise<any> {
    try {
      return await ctx.reply(text, { parse_mode: 'Markdown' });
    } catch {
      return await ctx.reply(text);
    }
  }

  onModuleDestroy(): void {
    if (this.bot) {
      this.logger.log('Stopping Telegram Bot gracefully...');
      this.bot.stop('Application terminated');
    }
  }
}
