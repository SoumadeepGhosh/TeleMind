import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Telegraf, Markup } from 'telegraf';
import { ConfigService } from '../../config/config.service';
import { AiService } from '../ai/ai.service';
import { RagService } from '../rag/rag.service';
import { StudyService } from '../rag/study.service';
import { PrismaService } from '../database/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DOCUMENT_QUEUE_NAME } from '../queue/queue.module';

type PendingAction = 'WAITING_NOTE' | 'WAITING_TOPIC' | 'WAITING_SEARCH';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private bot!: Telegraf;
  private readonly userStates = new Map<string, { action: PendingAction; timestamp: number }>();

  constructor(
    private readonly config: ConfigService,
    private readonly ai: AiService,
    private readonly rag: RagService,
    private readonly study: StudyService,
    private readonly prisma: PrismaService,
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

  public parseNote(rawText: string): { title: string; content: string } {
    const trimmed = rawText.trim();
    if (trimmed.includes('|')) {
      const parts = trimmed.split('|');
      const title = parts[0].trim();
      const content = parts.slice(1).join('|').trim();
      if (title && content) return { title, content };
    }
    const colonMatch = trimmed.match(/^([^:\n]{2,40}):\s*([\s\S]+)$/);
    if (colonMatch && colonMatch[1] && colonMatch[2]) {
      return { title: colonMatch[1].trim(), content: colonMatch[2].trim() };
    }
    const firstLineBreak = trimmed.indexOf('\n');
    if (firstLineBreak > 0 && firstLineBreak < 40) {
      const title = trimmed.substring(0, firstLineBreak).trim();
      const content = trimmed.substring(firstLineBreak + 1).trim();
      if (title && content) return { title, content };
    }
    const words = trimmed.split(/\s+/);
    const title = words.slice(0, 5).join(' ').substring(0, 35);
    return { title, content: trimmed };
  }

  private getMainMenuKeyboard() {
    return Markup.keyboard([
      ['📝 Save Note', '🎓 Research Topic'],
      ['🔍 Search Knowledge', '📚 My Documents'],
      ['🧹 Clear Memory', '❓ Help'],
    ]).resize();
  }

  private registerHandlers(): void {
    // Middleware: automatically record all incoming Telegram messages in database
    this.bot.use(async (ctx, next) => {
      if (ctx.message && 'text' in ctx.message && ctx.message.text) {
        void this.persistTelegramMessage(ctx, 'USER', ctx.message.text, ctx.message.message_id);
      }
      return next();
    });

    const getHelpMenu = (userName = 'Friend') =>
      `👋 *Hello ${userName}! Welcome to Soumadeep AI*\n` +
      `Your personal AI Knowledge & Voice Assistant powered by *Groq 120B* and *PostgreSQL pgvector*.\n\n` +
      `✨ *TWO EASY WAYS TO USE (No commands required!):*\n` +
      `1️⃣ *1-Tap Buttons:* Tap any button on your keyboard below!\n` +
      `2️⃣ *Talk Naturally:* Talk to me like a human. For example:\n` +
      `   • _"Remember that server IP is 192.168.1.1"_\n` +
      `   • _"Create a PDF on Quantum Computing"_\n` +
      `   • _"What did I note about server?"_\n` +
      `   • _"Delete note server IP"_\n` +
      `   • _"Show my documents"_\n\n` +
      `📖 *CLASSIC COMMANDS (Also Supported):*\n` +
      `• 🎓 \`/study <topic>\` - Autonomous Research & Master PDF\n` +
      `• 🔍 \`/ask <question>\` - Search private knowledge with citations\n` +
      `• 📝 \`/addnote <Title> | <Content>\` - Index a text note\n` +
      `• 📚 \`/listdocs\` - View indexed documents & 1-tap delete\n` +
      `• 🗑️ \`/deletedoc <Title or #>\` - Delete document\n` +
      `• 🧹 \`/clear\` - Reset conversation memory\n` +
      `• ❓ \`/help\` - Show this guide\n\n` +
      `🎙️ *Voice Notes:* Send audio to transcribe & get voice reply!\n` +
      `📎 *Uploads:* Send any PDF or text file to auto-index into pgvector!`;

    // Reusable handler for research / study topic
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleStudyTopic = async (ctx: any, topic: string) => {
      if (!topic) {
        return await this.safeReply(
          ctx,
          '⚠️ *Please specify a topic to research!*\n\n*Example:* `Quantum Computing` or `Docker Containerization`',
        );
      }

      this.logger.log(
        `🎓 Research & Study requested on: "${topic}" by @${ctx.from?.username || ctx.from?.id}`,
      );
      await ctx.sendChatAction('upload_document');

      const progressMsg = await ctx.reply(
        `🔍 *Researching authoritative documentation on "${topic}"...*\n\n` +
          `• Searching live web & official docs\n` +
          `• Synthesizing master technical guide with Groq 120B\n` +
          `• Compiling downloadable PDF & embedding into \`pgvector\`...\n\n` +
          `⏳ *Please wait ~10-15 seconds!*`,
        { parse_mode: 'Markdown' },
      );

      try {
        const result = await this.study.researchAndIndexTopic(topic);

        try {
          await ctx.deleteMessage(progressMsg.message_id);
        } catch {
          // Non-fatal
        }

        return await ctx.replyWithDocument(
          { source: result.pdfBuffer, filename: result.fileName },
          {
            caption:
              `🎓 *Master Guide Generated & Indexed!* 📚\n\n` +
              `📄 *Topic:* ${result.topic}\n` +
              `🧩 *Indexed Chunks:* ${result.indexedChunks} chunks in PostgreSQL \`pgvector\`\n\n` +
              `💡 *You can now ask questions about this document anytime!*`,
            parse_mode: 'Markdown',
            ...this.getMainMenuKeyboard(),
          },
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(`Error generating study doc: ${msg}`);
        return await this.safeReply(ctx, `❌ Failed to generate study doc: ${msg}`);
      }
    };

    // Reusable handler to list documents with 1-tap delete buttons
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listDocsHandler = async (ctx: any) => {
      await ctx.sendChatAction('typing');

      try {
        const docs = await this.rag.listDocuments();

        if (docs.length === 0) {
          return await this.safeReply(
            ctx,
            '📂 *Your knowledge base is empty!*\n\nTap *📝 Save Note* or upload a PDF/text file to get started.',
          );
        }

        const docLines = docs.map((d, index) => {
          const sizeKb = (d.fileSize / 1024).toFixed(1);
          const dateStr = new Date(d.createdAt).toLocaleDateString();
          return `${index + 1}. *${d.title}*\n   📊 ${d.totalChunks} chunks | 📦 ${sizeKb} KB | 📅 ${dateStr}`;
        });

        const reply = `📚 *Indexed Knowledge Documents (${docs.length}):*\n\n${docLines.join('\n\n')}\n\n👇 *Tap a button below to delete any document:*`;

        // Create 1-tap delete buttons for documents (up to 8 recent docs)
        const deleteButtons = docs.slice(0, 8).map((d) => [
          Markup.button.callback(
            `🗑️ Delete "${d.title.length > 24 ? d.title.substring(0, 22) + '...' : d.title}"`,
            `del_${d.id}`,
          ),
        ]);

        return await ctx.reply(reply, {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard(deleteButtons),
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.logger.error(`Error listing docs: ${errorMsg}`);
        return await this.safeReply(ctx, `❌ Failed to list documents: ${errorMsg}`);
      }
    };

    // 1-Tap Inline Button Action: Delete document
    this.bot.action(/^del_(.+)$/, async (ctx) => {
      const docId = ctx.match[1];
      try {
        await ctx.answerCbQuery('Processing deletion...');
        const result = await this.rag.deleteDocument(docId);
        if (result.deleted) {
          await ctx.editMessageText(
            `🗑️ *Document Deleted Successfully:*\n"${result.title}" and all its vector chunks have been purged from PostgreSQL.`,
            { parse_mode: 'Markdown' },
          );
        } else {
          await ctx.editMessageText('⚠️ Document not found or already deleted.');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        await ctx.reply(`❌ Could not delete: ${msg}`);
      }
    });

    // 1-Tap Keyboard Menu Listeners
    this.bot.hears('📝 Save Note', async (ctx) => {
      const userId = String(ctx.from.id);
      this.userStates.set(userId, { action: 'WAITING_NOTE', timestamp: Date.now() });
      return await this.safeReply(
        ctx,
        `📝 *What note would you like me to save?*\n\n` +
          `Simply send your note text in your next message.\n` +
          `• Example: _Server IP is 192.168.1.50_\n` +
          `• Or with title: _Flight Info: AI-202 on Friday_\n\n` +
          `_(Type "cancel" anytime to abort)_`,
      );
    });

    this.bot.hears('🎓 Research Topic', async (ctx) => {
      const userId = String(ctx.from.id);
      this.userStates.set(userId, { action: 'WAITING_TOPIC', timestamp: Date.now() });
      return await this.safeReply(
        ctx,
        `🎓 *What topic would you like me to research?*\n\n` +
          `Send any topic (e.g., _Retrieval-Augmented Generation_, _Quantum Computing_, _FastAPI Architecture_).\n` +
          `I will research authoritative sources, synthesize a comprehensive technical whitepaper, and compile a Master PDF Guide for you!\n\n` +
          `_(Type "cancel" anytime to abort)_`,
      );
    });

    this.bot.hears('🔍 Search Knowledge', async (ctx) => {
      const userId = String(ctx.from.id);
      this.userStates.set(userId, { action: 'WAITING_SEARCH', timestamp: Date.now() });
      return await this.safeReply(
        ctx,
        `🔍 *Search Private Knowledge Base*\n\n` +
          `Send your question or search query. I will search all your indexed documents and notes with vector cosine similarity.\n\n` +
          `_(Type "cancel" anytime to abort)_`,
      );
    });

    this.bot.hears('📚 My Documents', listDocsHandler);

    this.bot.hears('🧹 Clear Memory', async (ctx) => {
      this.ai.clearHistory(String(ctx.chat.id));
      this.userStates.delete(String(ctx.from.id));
      return await this.safeReply(
        ctx,
        '🧹 *Conversation memory cleared!* Starting a fresh chat session.',
      );
    });

    this.bot.hears('❓ Help', async (ctx) => {
      const userName = ctx.from.first_name || 'Friend';
      return await this.safeReply(ctx, getHelpMenu(userName));
    });

    // Command: /start
    this.bot.start(async (ctx) => {
      const userName = ctx.from.first_name || 'Friend';
      this.logger.log(`📥 Received /start from @${ctx.from.username || ctx.from.id} (${userName})`);
      return await this.safeReply(ctx, getHelpMenu(userName));
    });

    // Command: /help
    this.bot.help(async (ctx) => {
      const userName = ctx.from.first_name || 'Friend';
      this.logger.log(`📥 Received /help from @${ctx.from.username || ctx.from.id}`);
      return await this.safeReply(ctx, getHelpMenu(userName));
    });

    // Command: /clear - Reset conversation memory
    this.bot.command('clear', async (ctx) => {
      this.ai.clearHistory(String(ctx.chat.id));
      this.userStates.delete(String(ctx.from.id));
      this.logger.log(`🧹 Conversation memory cleared for @${ctx.from.username || ctx.from.id}`);
      return await this.safeReply(
        ctx,
        '🧹 *Conversation memory cleared!* Starting a fresh chat session.',
      );
    });

    // Command: /study <topic> or /research <topic>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleStudyCommand = async (ctx: any) => {
      const messageText = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
      const topic = messageText.replace(/^\/(study|research)\s*/i, '').trim();
      return await handleStudyTopic(ctx, topic);
    };

    this.bot.command('study', handleStudyCommand);
    this.bot.command('research', handleStudyCommand);

    // Command: /listdocs - List all indexed documents in PostgreSQL
    this.bot.command('listdocs', listDocsHandler);

    // Command: /deletedoc <title or id>
    this.bot.command('deletedoc', async (ctx) => {
      const target = ctx.message.text.replace(/^\/deletedoc\s*/i, '').trim();

      if (!target) {
        return await this.safeReply(
          ctx,
          '⚠️ Please provide the title, index number, or ID of the document to delete.\n\n*Example:*\n`/deletedoc 1` or `/deletedoc notes.pdf`',
        );
      }

      await ctx.sendChatAction('typing');

      try {
        const result = await this.rag.deleteDocument(target);

        if (!result.deleted) {
          return await this.safeReply(
            ctx,
            `⚠️ Document not found: "${target}". Tap *📚 My Documents* to view available documents.`,
          );
        }

        return await this.safeReply(
          ctx,
          `🗑️ *Document Deleted Successfully:*\n"${result.title}" and all its vector chunks have been removed from PostgreSQL.`,
        );
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.logger.error(`Error deleting doc: ${errorMsg}`);
        return await this.safeReply(ctx, `❌ Failed to delete document: ${errorMsg}`);
      }
    });

    // Command: /addnote <Title> | <Content>
    this.bot.command('addnote', async (ctx) => {
      const fullText = ctx.message.text.replace(/^\/addnote\s*/i, '').trim();
      const { title, content } = this.parseNote(fullText);

      if (!title || !content) {
        return await this.safeReply(
          ctx,
          `⚠️ *Invalid format!* Please send title and content:\n\n*Example:*\n\`/addnote Server IP | 192.168.1.1\``,
        );
      }

      await ctx.sendChatAction('typing');

      try {
        const result = await this.rag.indexTextDocument(title, content);
        return await this.safeReply(
          ctx,
          `✅ *Document Indexed Successfully!*\n\n` +
            `📁 *Title:* ${title}\n` +
            `🔢 *Vector Chunks:* ${result.chunkCount} chunks (768 dimensions)\n` +
            `💾 *Database:* Stored in PostgreSQL \`pgvector\`\n\n` +
            `You can now ask questions about it anytime!`,
        );
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.logger.error(`Error indexing note: ${errorMsg}`);
        return await this.safeReply(ctx, `❌ Failed to index document: ${errorMsg}`);
      }
    });

    // Command: /ask <query> - Grounded RAG Search
    this.bot.command('ask', async (ctx) => {
      const query = ctx.message.text.replace(/^\/ask\s*/i, '').trim();

      if (!query) {
        return await this.safeReply(
          ctx,
          `⚠️ Please provide a question after \`/ask\`.\n\n*Example:*\n\`/ask What is the refund policy?\``,
        );
      }

      const user = `@${ctx.from.username || ctx.from.id}`;
      this.logger.log(`🔎 [RAG Search] Query from ${user}: "${query}"`);
      await ctx.sendChatAction('typing');

      try {
        const { answer, sources } = await this.rag.answerWithKnowledge(query, String(ctx.chat.id));

        let replyMessage = answer;
        if (sources.length > 0) {
          replyMessage += `\n\n📚 *Sources Cited:*\n${sources.map((s) => `• ${s}`).join('\n')}`;
        }

        return await this.safeReply(ctx, replyMessage);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.logger.error(`RAG Search error: ${errorMsg}`);
        return await this.safeReply(ctx, `❌ Error querying knowledge base: ${errorMsg}`);
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

    // Generic text messages -> State Machine & Natural Language Intent Detection (Solution 1 & 2)
    this.bot.on('text', async (ctx) => {
      const text = ctx.message.text?.trim() || '';
      const userId = String(ctx.from?.id);
      const user = `@${ctx.from?.username || ctx.from?.id}`;

      // Ignore other bot commands that start with /
      if (text.startsWith('/')) {
        return;
      }

      // Check if user types "cancel" or "exit"
      if (/^(cancel|abort|exit|stop)$/i.test(text)) {
        if (this.userStates.has(userId)) {
          this.userStates.delete(userId);
          return await this.safeReply(ctx, '✖️ *Action cancelled.* How else can I help you?');
        }
      }

      // 1. Solution 2: Handle Interactive Pending Action States
      const pending = this.userStates.get(userId);
      if (pending) {
        this.userStates.delete(userId);

        if (pending.action === 'WAITING_NOTE') {
          const { title, content } = this.parseNote(text);
          await ctx.sendChatAction('typing');
          try {
            const result = await this.rag.indexTextDocument(title, content);
            return await this.safeReply(
              ctx,
              `✅ *Note Saved Successfully!* 📝\n\n` +
                `📌 *Title:* ${title}\n` +
                `📄 *Content:* ${content}\n` +
                `🔢 *Chunks:* ${result.chunkCount} vector embeddings in PostgreSQL \`pgvector\`\n\n` +
                `💡 You can ask me about this note anytime!`,
            );
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            return await this.safeReply(ctx, `❌ Failed to save note: ${msg}`);
          }
        }

        if (pending.action === 'WAITING_TOPIC') {
          return await handleStudyTopic(ctx, text);
        }

        if (pending.action === 'WAITING_SEARCH') {
          await ctx.sendChatAction('typing');
          try {
            const { answer, sources } = await this.rag.answerWithKnowledge(
              text,
              String(ctx.chat.id),
            );
            let reply = answer;
            if (sources.length > 0) {
              reply += `\n\n📚 *Sources Cited:*\n${sources.map((s) => `• ${s}`).join('\n')}`;
            }
            return await this.safeReply(ctx, reply);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            return await this.safeReply(ctx, `❌ Error searching knowledge: ${msg}`);
          }
        }
      }

      // 2. Solution 1: Natural Language Intent Detection (Zero-Command Execution)

      // A. Save / Remember Note Intent
      const saveNoteMatch =
        text.match(
          /^(?:please\s+)?(?:remember\s+(?:that\s+)?|note\s+(?:down\s+)?(?:that\s+)?|save\s+(?:this\s+)?note(?:\s*:)?|take\s+(?:a\s+)?note(?:\s*:)?|keep\s+in\s+mind\s+(?:that\s+)?)(.+)$/is,
        ) || text.match(/^(?:note|remember)\s*:\s*(.+)$/is);

      if (saveNoteMatch && saveNoteMatch[1]) {
        const rawNote = saveNoteMatch[1].trim();
        const { title, content } = this.parseNote(rawNote);
        await ctx.sendChatAction('typing');
        try {
          const result = await this.rag.indexTextDocument(title, content);
          return await this.safeReply(
            ctx,
            `✅ *Note Saved Successfully!* 📝\n\n` +
              `📌 *Title:* ${title}\n` +
              `📄 *Content:* ${content}\n` +
              `🔢 *Chunks:* ${result.chunkCount} vector embeddings in PostgreSQL \`pgvector\`\n\n` +
              `💡 Stored in your private knowledge base. You can ask me about it anytime!`,
          );
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          return await this.safeReply(ctx, `❌ Failed to save note: ${msg}`);
        }
      }

      // B. Delete Document / Note Intent
      const deleteMatch =
        text.match(
          /^(?:please\s+)?(?:delete|remove)\s+(?:the\s+|my\s+)?(?:note|document|doc|file)\s*(?:called\s+|titled\s+|about\s+|on\s+|#\s*)?(.+)$/is,
        ) || text.match(/^delete\s+(\d+|[a-zA-Z0-9_\-\.\s]{2,40})$/i);

      if (deleteMatch && deleteMatch[1]) {
        const target = deleteMatch[1].trim();
        await ctx.sendChatAction('typing');
        try {
          const result = await this.rag.deleteDocument(target);
          if (result.deleted) {
            return await this.safeReply(
              ctx,
              `🗑️ *Document Deleted Successfully:*\n"${result.title}" and its vector chunks have been removed from PostgreSQL.`,
            );
          }
          return await this.safeReply(
            ctx,
            `⚠️ Document not found: "${target}". Tap *📚 My Documents* to view available documents.`,
          );
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          return await this.safeReply(ctx, `❌ Failed to delete document: ${msg}`);
        }
      }

      // C. List Documents / Notes Intent
      if (
        /^(?:show|list|view|what\s+are)\s+(?:all\s+)?(?:my\s+)?(?:notes|documents|docs|files|knowledge)(?:\s*\?)?$/i.test(
          text,
        ) ||
        /^(?:my\s+notes|my\s+documents|list\s+docs|all\s+notes)$/i.test(text)
      ) {
        return await listDocsHandler(ctx);
      }

      // D. Autonomous Research & PDF Generation Intent
      const studyMatch =
        text.match(
          /^(?:please\s+)?(?:create|make|generate)\s+(?:a\s+)?(?:master\s+)?(?:pdf|guide|whitepaper|document)\s+(?:on|about)\s+(.+)$/is,
        ) ||
        text.match(/^(?:please\s+)?(?:research|study)\s+(?:on|about\s+)(.+)$/is) ||
        text.match(/^(?:teach\s+me\s+about|deep\s+dive\s+into)\s+(.+)$/is);

      if (studyMatch && studyMatch[1]) {
        return await handleStudyTopic(ctx, studyMatch[1].trim());
      }

      // E. Clear Chat Intent
      if (
        /^(?:clear|reset|forget)\s+(?:our\s+|my\s+|the\s+)?(?:chat|conversation|memory|history)(?:\s*\?)?$/i.test(
          text,
        ) ||
        /^(?:clear\s+memory|reset\s+chat|forget\s+everything)$/i.test(text)
      ) {
        this.ai.clearHistory(String(ctx.chat.id));
        this.userStates.delete(userId);
        return await this.safeReply(
          ctx,
          '🧹 *Conversation memory cleared!* Starting a fresh chat session.',
        );
      }

      // F. Recall Knowledge / Notes Intent
      const recallMatch = text.match(
        /^(?:what\s+did\s+i\s+note\s+about|what\s+do\s+i\s+have\s+on|do\s+i\s+have\s+(?:a\s+)?note\s+(?:on|about)|search\s+(?:my\s+)?(?:notes|docs|knowledge)\s+(?:for|about)?|check\s+(?:my\s+)?(?:notes|docs)\s+(?:for|about)?)\s+(.+)$/is,
      );

      if (recallMatch && recallMatch[1]) {
        await ctx.sendChatAction('typing');
        try {
          const { answer, sources } = await this.rag.answerWithKnowledge(
            recallMatch[1].trim(),
            String(ctx.chat.id),
          );
          let reply = answer;
          if (sources.length > 0) {
            reply += `\n\n📚 *Sources Cited:*\n${sources.map((s) => `• ${s}`).join('\n')}`;
          }
          return await this.safeReply(ctx, reply);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          return await this.safeReply(ctx, `❌ Error retrieving knowledge: ${msg}`);
        }
      }

      // G. Default Conversational AI Chat with Groq 120B
      this.logger.log(`💬 Processing AI query from ${user}: "${text}"`);
      await ctx.sendChatAction('typing');

      try {
        let isFirstMessage = false;
        try {
          const prevCount = await this.prisma.telegramMessage.count({
            where: {
              telegramChat: { chatId: BigInt(ctx.chat.id) },
              role: 'ASSISTANT',
            },
          });
          isFirstMessage = prevCount === 0;
        } catch {
          isFirstMessage = false;
        }

        const answer = await this.ai.generateAnswer(text, undefined, String(ctx.chat.id));
        this.logger.log(`✅ AI answered ${user} successfully`);

        if (isFirstMessage) {
          const welcome = getHelpMenu(ctx.from?.first_name || 'Friend');
          await this.safeReply(ctx, welcome);
        }

        return await this.safeReply(ctx, answer);
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
   * Automatically attaches the persistent 1-tap keyboard buttons unless overridden.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async safeReply(ctx: any, text: string, extra?: any): Promise<any> {
    void this.persistTelegramMessage(ctx, 'ASSISTANT', text);
    const options = {
      parse_mode: 'Markdown' as const,
      ...this.getMainMenuKeyboard(),
      ...(extra || {}),
    };
    try {
      return await ctx.reply(text, options);
    } catch {
      return await ctx.reply(text, { ...this.getMainMenuKeyboard(), ...(extra || {}) });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async persistTelegramMessage(
    ctx: any,
    role: 'USER' | 'ASSISTANT',
    text: string,
    messageId?: number,
  ): Promise<void> {
    try {
      const from = ctx.from;
      const chat = ctx.chat;
      if (!from || !chat) return;

      const user = await this.prisma.telegramUser.upsert({
        where: { telegramId: BigInt(from.id) },
        update: {
          username: from.username ?? null,
          firstName: from.first_name ?? null,
          lastName: from.last_name ?? null,
        },
        create: {
          telegramId: BigInt(from.id),
          username: from.username ?? null,
          firstName: from.first_name ?? null,
          lastName: from.last_name ?? null,
        },
      });

      const chatRecord = await this.prisma.telegramChat.upsert({
        where: { chatId: BigInt(chat.id) },
        update: {
          type: chat.type ?? 'private',
          title: ('title' in chat ? chat.title : from.first_name) ?? null,
        },
        create: {
          chatId: BigInt(chat.id),
          type: chat.type ?? 'private',
          title: ('title' in chat ? chat.title : from.first_name) ?? null,
        },
      });

      await this.prisma.telegramChatMember.upsert({
        where: {
          telegramUserId_telegramChatId: {
            telegramUserId: user.id,
            telegramChatId: chatRecord.id,
          },
        },
        update: {},
        create: {
          telegramUserId: user.id,
          telegramChatId: chatRecord.id,
        },
      });

      await this.prisma.telegramMessage.create({
        data: {
          telegramUserId: role === 'USER' ? user.id : null,
          telegramChatId: chatRecord.id,
          messageId: BigInt(messageId ?? ctx.message?.message_id ?? Date.now()),
          role,
          text,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`⚠️ Failed to persist Telegram message to database: ${msg}`);
    }
  }

  onModuleDestroy(): void {
    if (this.bot) {
      this.logger.log('Stopping Telegram Bot gracefully...');
      this.bot.stop('Application terminated');
    }
  }
}
