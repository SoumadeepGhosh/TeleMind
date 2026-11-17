import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client, LocalAuth, Message, MessageMedia } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import { AiService } from '../ai/ai.service';
import { RagService } from '../rag/rag.service';
import { StudyService } from '../rag/study.service';
import { PrismaService } from '../database/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DOCUMENT_QUEUE_NAME } from '../queue/queue.module';

type PendingAction = 'WAITING_NOTE' | 'WAITING_TOPIC' | 'WAITING_SEARCH';

@Injectable()
export class WhatsappService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsappService.name);
  private client!: Client;
  private readonly userStates = new Map<string, { action: PendingAction; timestamp: number }>();

  constructor(
    private readonly ai: AiService,
    private readonly rag: RagService,
    private readonly study: StudyService,
    private readonly prisma: PrismaService,
    @InjectQueue(DOCUMENT_QUEUE_NAME) private readonly docQueue: Queue,
  ) {}

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

  private getInteractiveMenu(): string {
    return (
      `🤖 *Soumadeep AI — Interactive Menu*\n\n` +
      `Reply with a number *1 - 6* or talk naturally:\n\n` +
      `1️⃣ *Save a Note*\n` +
      `   _Store reminders, snippets, or facts into pgvector_\n` +
      `2️⃣ *Research a Topic (PDF)*\n` +
      `   _Compile an authoritative Master PDF Guide_\n` +
      `3️⃣ *Search Knowledge Base*\n` +
      `   _Ask anything grounded in your private notes & docs_\n` +
      `4️⃣ *My Documents & Notes*\n` +
      `   _View all saved docs or delete any file_\n` +
      `5️⃣ *Clear Conversation Memory*\n` +
      `   _Start fresh session_\n` +
      `6️⃣ *Help & Command Guide*\n` +
      `   _View full command guide_\n\n` +
      `💡 *Tip:* You can talk naturally without commands (e.g. _"Remember that flight is at 6am"_ or _"Create a PDF on Docker"_)!`
    );
  }

  private getHelpGuide(): string {
    return (
      `🤖 *Soumadeep AI — Complete WhatsApp Guide*\n\n` +
      `✨ *TWO EASY WAYS TO USE (No commands required!):*\n` +
      `1️⃣ *Interactive Menu:* Reply *menu* anytime to view 1-tap numbered choices!\n` +
      `2️⃣ *Talk Naturally:* Talk to me like a human. For example:\n` +
      `   • _"Remember that server IP is 192.168.1.1"_\n` +
      `   • _"Create a PDF on Quantum Computing"_\n` +
      `   • _"What did I note about server?"_\n` +
      `   • _"Delete note 1" or "Delete note server"_\n` +
      `   • _"Show my documents"_\n\n` +
      `📖 *CLASSIC COMMANDS (Also Supported):*\n` +
      `• 🎓 *!study <topic>* - Autonomous Research & Master PDF\n` +
      `• 🔍 *!ask <question>* - Search private knowledge with citations\n` +
      `• 📝 *!addnote <Title> | <Content>* - Index a text note\n` +
      `• 📚 *!listdocs* - View all indexed documents\n` +
      `• 🗑️ *!deletedoc <Title or #>* - Delete document\n` +
      `• 🧹 *!clear* - Reset conversation memory\n` +
      `• ❓ *!help* - Show this command guide\n\n` +
      `🎙️ *Voice Notes:* Send audio to transcribe & reply in voice!\n` +
      `📎 *Uploads:* Send any PDF or text file to auto-index into pgvector!`
    );
  }

  private async handleStudyAction(msg: Message, sender: string, topic: string): Promise<void> {
    if (!topic) {
      return void (await this.replyAndPersist(
        msg,
        sender,
        '⚠️ Please provide a topic to research.\n*Example:* Quantum Computing',
      ));
    }

    await this.replyAndPersist(
      msg,
      sender,
      `🔍 *Researching authoritative documentation on "${topic}"...*\n\n` +
        `• Searching live web & official docs\n` +
        `• Synthesizing master technical guide with Groq 120B\n` +
        `• Compiling downloadable PDF & embedding into \`pgvector\`...\n\n` +
        `⏳ *Please wait ~10-15 seconds!*`,
    );

    try {
      const result = await this.study.researchAndIndexTopic(topic);
      const pdfMedia = new MessageMedia(
        'application/pdf',
        result.pdfBuffer.toString('base64'),
        result.fileName,
      );

      await msg.reply(pdfMedia, undefined, {
        caption:
          `🎓 *Master Guide Generated & Indexed!* 📚\n\n` +
          `📄 *Topic:* ${result.topic}\n` +
          `🧩 *Indexed Chunks:* ${result.indexedChunks} chunks in PostgreSQL \`pgvector\`\n\n` +
          `💡 *You can now ask questions about this document anytime!*`,
      });

      void this.persistWhatsappMessage(
        sender,
        'ASSISTANT',
        `[Sent Master Guide PDF: ${result.fileName}]`,
        `pdf_${Date.now()}`,
        'document',
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return void (await this.replyAndPersist(
        msg,
        sender,
        `❌ Failed to generate study doc: ${errorMsg}`,
      ));
    }
  }

  onModuleInit(): void {
    this.logger.log('📱 Initializing WhatsApp Web Client...');

    const chromePath =
      process.env.CHROME_BIN || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

    this.client = new Client({
      authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
      puppeteer: {
        headless: true,
        executablePath: chromePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      },
    });

    // 1. QR Code generated event
    this.client.on('qr', (qr) => {
      this.logger.log('📲 QR Code received! Scan this with your WhatsApp:');
      qrcode.generate(qr, { small: true });
    });

    // 2. Ready event
    this.client.on('ready', () => {
      this.logger.log('🚀 WhatsApp Bot is connected and ready!');
    });

    // 3. Authenticated
    this.client.on('authenticated', () => {
      this.logger.log('✅ WhatsApp session authenticated successfully!');
    });

    // 4. Auth failure
    this.client.on('auth_failure', (msg) => {
      this.logger.error(`❌ WhatsApp auth failure: ${msg}`);
    });

    // 5. Incoming message handler from other people
    this.client.on('message', async (msg) => {
      await this.handleMessage(msg);
    });

    // 6. Support "Message yourself" (Self-chat on your own number)
    this.client.on('message_create', async (msg) => {
      // Only trigger if sent by you TO your own number (self-chat), avoiding bot reply loops
      if (
        msg.fromMe &&
        this.client.info &&
        msg.to === this.client.info.wid._serialized &&
        !msg.body?.startsWith('🤖') &&
        !msg.body?.startsWith('🎙️') &&
        !msg.body?.startsWith('⏳') &&
        !msg.body?.startsWith('✅') &&
        !msg.body?.startsWith('📖') &&
        !msg.body?.startsWith('🧹') &&
        !msg.body?.startsWith('📚')
      ) {
        await this.handleMessage(msg);
      }
    });

    // Initialize client
    this.client.initialize().catch((err: unknown) => {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to initialize WhatsApp client: ${errorMsg}`);
    });
  }

  private async handleMessage(msg: Message): Promise<void> {
    // 1. Ignore status broadcasts and empty messages
    if (msg.from === 'status@broadcast' || (!msg.body && !msg.hasMedia)) {
      return;
    }

    const sender = msg.from; // unique sender ID (e.g. 919876543210@c.us)
    const text = msg.body?.trim() || '';

    // ⛔ RULE: 100% BAN ALL GROUPS (Never process or reply to any group under any circumstance!)
    if (sender.endsWith('@g.us') || msg.to?.endsWith('@g.us')) {
      return;
    }

    this.logger.log(`📩 Soumadeep AI received message in personal chat from ${sender}: "${text}"`);

    const isSelfChat =
      msg.fromMe && this.client.info && msg.to === this.client.info.wid._serialized;

    // Detect if this is an unknown number (not saved in address book)
    let isUnknownNumber = false;
    try {
      const contact = await msg.getContact();
      isUnknownNumber = !contact?.isMyContact && !isSelfChat;
    } catch {
      isUnknownNumber = false;
    }

    if (isUnknownNumber) {
      this.logger.log(`👤 Unknown contact detected: ${sender}`);
    }

    let isFirstMessageFromUnknown = false;
    if (isUnknownNumber) {
      try {
        const assistantRepliesCount = await this.prisma.whatsappMessage.count({
          where: {
            whatsappChat: { chatJid: sender },
            role: 'ASSISTANT',
          },
        });
        isFirstMessageFromUnknown = assistantRepliesCount === 0;
      } catch {
        isFirstMessageFromUnknown = false;
      }
    }

    // Clean @ai prefix if user still used it optionally
    const cleanPrompt = text.replace(/^(@ai|!ai|\/ai)\s*/i, '').trim();

    // Persist incoming user message to database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contactName = (msg as any)._data?.notifyName || sender.split('@')[0];
    void this.persistWhatsappMessage(
      sender,
      'USER',
      text || `[Media: ${msg.type}]`,
      msg.id?._serialized || String(Date.now()),
      msg.type,
      contactName,
    );

    try {
      // 1. Voice Notes & Audio Messages
      if (msg.hasMedia && (msg.type === 'ptt' || msg.type === 'audio')) {
        const media = await msg.downloadMedia();
        if (media && media.data) {
          const audioBuffer = Buffer.from(media.data, 'base64');
          this.logger.log(
            `🎙️ Received voice note from ${sender}, transcribing with Groq Whisper...`,
          );

          const transcription = await this.ai.transcribeAudio(
            audioBuffer,
            media.mimetype || 'audio/ogg',
          );
          this.logger.log(`📝 Transcribed text: "${transcription}"`);

          if (!transcription) {
            return void (await this.replyAndPersist(
              msg,
              sender,
              '⚠️ Could not clearly hear the voice message. Please try speaking again.',
            ));
          }

          // Generate answer with Soumadeep AI (Groq 120B)
          const unknownContext = isUnknownNumber
            ? "NOTE: The sender is an unknown/unsaved contact messaging Soumadeep on WhatsApp. Be polite, helpful, and professional. Let them know you are Soumadeep's AI assistant."
            : undefined;

          let answer = await this.ai.generateAnswer(transcription, unknownContext, sender);

          if (isFirstMessageFromUnknown) {
            answer = `👋 *Hello! I am Soumadeep's AI Assistant (Soumadeep AI).*\nSoumadeep may be busy or away right now, but I can help answer your questions or take a message for him.\n\n${answer}`;
          }

          // Synthesize spoken voice note
          try {
            const speechBase64 = await this.ai.generateSpeechAudio(answer);
            const voiceMedia = new MessageMedia(
              'audio/mp3',
              speechBase64,
              'soumadeep_ai_reply.mp3',
            );
            await msg.reply(voiceMedia, undefined, { sendAudioAsVoice: true });
          } catch (audioErr) {
            this.logger.warn(`Could not synthesize voice reply: ${audioErr}`);
          }

          // Also reply with text transcription and answer
          return void (await this.replyAndPersist(
            msg,
            sender,
            `🎙️ *You said:* "${transcription}"\n\n🤖 *Soumadeep AI:*\n${answer}`,
          ));
        }
      }

      // 2. Document attachments in personal chats
      if (msg.hasMedia) {
        const media = await msg.downloadMedia();
        if (media && (media.mimetype === 'application/pdf' || media.mimetype.startsWith('text/'))) {
          const fileName = media.filename || 'whatsapp_document.pdf';
          const job = await this.docQueue.add('index-document', {
            fileName,
            mimeType: media.mimetype,
            bufferBase64: media.data,
            source: 'whatsapp',
            senderId: sender,
          });

          this.logger.log(
            `📥 Added WhatsApp document "${fileName}" to BullMQ Queue (Job ID: ${job.id})`,
          );

          return void (await this.replyAndPersist(
            msg,
            sender,
            `⚡ *Document Queued in Background! (Job #${job.id})*\n\n` +
              `📄 *File:* ${fileName}\n` +
              `⚙️ *Status:* BullMQ worker is parsing & embedding into PostgreSQL \`pgvector\`...\n\n` +
              `You can ask questions about it using *!ask <question>* in a few seconds!`,
          ));
        }
      }

      // --- SOLUTION 2: State Cancellation ---
      if (/^(cancel|abort|exit|stop)$/i.test(text)) {
        if (this.userStates.has(sender)) {
          this.userStates.delete(sender);
          return void (await this.replyAndPersist(
            msg,
            sender,
            '✖️ *Action cancelled.* How can I help you? Reply *menu* to see options.',
          ));
        }
      }

      // --- SOLUTION 2: Handle Interactive Pending Action States ---
      const pending = this.userStates.get(sender);
      if (pending) {
        this.userStates.delete(sender);

        if (pending.action === 'WAITING_NOTE') {
          const { title, content } = this.parseNote(text);
          try {
            const result = await this.rag.indexTextDocument(title, content);
            return void (await this.replyAndPersist(
              msg,
              sender,
              `✅ *Note Saved Successfully!* 📝\n\n` +
                `📌 *Title:* ${title}\n` +
                `📄 *Content:* ${content}\n` +
                `🔢 *Chunks:* ${result.chunkCount} vector embeddings in PostgreSQL \`pgvector\`\n\n` +
                `💡 You can ask me about this note anytime!`,
            ));
          } catch (err: unknown) {
            const msgStr = err instanceof Error ? err.message : String(err);
            return void (await this.replyAndPersist(
              msg,
              sender,
              `❌ Failed to save note: ${msgStr}`,
            ));
          }
        }

        if (pending.action === 'WAITING_TOPIC') {
          return void (await this.handleStudyAction(msg, sender, text));
        }

        if (pending.action === 'WAITING_SEARCH') {
          const { answer, sources } = await this.rag.answerWithKnowledge(text, sender);
          let replyText = answer;
          if (sources.length > 0) {
            replyText += `\n\n📚 *Sources Cited:*\n${sources.map((s) => `• ${s}`).join('\n')}`;
          }
          return void (await this.replyAndPersist(msg, sender, replyText));
        }
      }

      // --- SOLUTION 2: Quick Interactive Menu Trigger ---
      if (
        text.toLowerCase() === 'menu' ||
        text === '#' ||
        text.toLowerCase() === '!menu' ||
        text.toLowerCase() === '/menu'
      ) {
        return void (await this.replyAndPersist(msg, sender, this.getInteractiveMenu()));
      }

      // --- SOLUTION 2: Numbered Menu Choices (1-6) ---
      if (text === '1' || text === '1️⃣' || text.toLowerCase() === 'save note') {
        this.userStates.set(sender, { action: 'WAITING_NOTE', timestamp: Date.now() });
        return void (await this.replyAndPersist(
          msg,
          sender,
          `📝 *What note would you like me to save?*\n\n` +
            `Send your note text in your next reply.\n` +
            `• Example: _Server IP: 192.168.1.50_\n` +
            `• Or: _Meeting with Alex on Friday at 4 PM_\n\n` +
            `_(Reply "cancel" anytime to abort)_`,
        ));
      }

      if (text === '2' || text === '2️⃣' || text.toLowerCase() === 'research') {
        this.userStates.set(sender, { action: 'WAITING_TOPIC', timestamp: Date.now() });
        return void (await this.replyAndPersist(
          msg,
          sender,
          `🎓 *What topic would you like me to research?*\n\n` +
            `Send any topic (e.g., _Retrieval-Augmented Generation_, _Docker Containerization_, _Quantum Computing_).\n` +
            `I will research authoritative sources and generate a downloadable Master PDF Guide!\n\n` +
            `_(Reply "cancel" anytime to abort)_`,
        ));
      }

      if (text === '3' || text === '3️⃣' || text.toLowerCase() === 'search') {
        this.userStates.set(sender, { action: 'WAITING_SEARCH', timestamp: Date.now() });
        return void (await this.replyAndPersist(
          msg,
          sender,
          `🔍 *Search Private Knowledge Base*\n\n` +
            `What question or topic would you like to search for in your saved documents and notes?\n\n` +
            `_(Reply "cancel" anytime to abort)_`,
        ));
      }

      if (text === '4' || text === '4️⃣' || text.toLowerCase() === 'documents') {
        const docs = await this.rag.listDocuments();
        if (docs.length === 0) {
          return void (await this.replyAndPersist(
            msg,
            sender,
            '📂 *Your knowledge base is empty!*\n\nReply *1* to save a note or attach a PDF file to index it.',
          ));
        }
        const docList = docs
          .map((d, i) => `${i + 1}. *${d.title}* (${d.totalChunks} chunks)`)
          .join('\n');
        return void (await this.replyAndPersist(
          msg,
          sender,
          `📚 *Indexed Knowledge Documents (${docs.length}):*\n\n${docList}\n\n` +
            `💡 *To delete any document, simply reply:*\n` +
            `"Delete <number>" (e.g. *Delete 1*) or "Delete <title>"`,
        ));
      }

      if (text === '5' || text === '5️⃣' || text.toLowerCase() === 'clear memory') {
        this.ai.clearHistory(sender);
        this.userStates.delete(sender);
        return void (await this.replyAndPersist(
          msg,
          sender,
          '🧹 *Conversation memory cleared!* Starting a fresh chat session.',
        ));
      }

      if (text === '6' || text === '6️⃣') {
        return void (await this.replyAndPersist(msg, sender, this.getHelpGuide()));
      }

      // --- SOLUTION 1: Natural Language Intent Detection (Zero-Command UX) ---

      // A. Save / Remember Note Intent
      const saveNoteMatch =
        text.match(
          /^(?:please\s+)?(?:remember\s+(?:that\s+)?|note\s+(?:down\s+)?(?:that\s+)?|save\s+(?:this\s+)?note(?:\s*:)?|take\s+(?:a\s+)?note(?:\s*:)?|keep\s+in\s+mind\s+(?:that\s+)?)(.+)$/is,
        ) || text.match(/^(?:note|remember)\s*:\s*(.+)$/is);

      if (saveNoteMatch && saveNoteMatch[1]) {
        const rawNote = saveNoteMatch[1].trim();
        const { title, content } = this.parseNote(rawNote);
        try {
          const result = await this.rag.indexTextDocument(title, content);
          return void (await this.replyAndPersist(
            msg,
            sender,
            `✅ *Note Saved Successfully!* 📝\n\n` +
              `📌 *Title:* ${title}\n` +
              `📄 *Content:* ${content}\n` +
              `🔢 *Chunks:* ${result.chunkCount} vector embeddings in PostgreSQL \`pgvector\`\n\n` +
              `💡 Stored in your private knowledge base. You can ask me about it anytime!`,
          ));
        } catch (err: unknown) {
          const msgStr = err instanceof Error ? err.message : String(err);
          return void (await this.replyAndPersist(
            msg,
            sender,
            `❌ Failed to save note: ${msgStr}`,
          ));
        }
      }

      // B. Delete Document / Note Intent
      const deleteMatch =
        text.match(
          /^(?:please\s+)?(?:delete|remove)\s+(?:the\s+|my\s+)?(?:note|document|doc|file)\s*(?:called\s+|titled\s+|about\s+|on\s+|#\s*)?(.+)$/is,
        ) || text.match(/^delete\s+(\d+|[a-zA-Z0-9_\-\.\s]{2,40})$/i);

      if (deleteMatch && deleteMatch[1]) {
        const target = deleteMatch[1].trim();
        try {
          const result = await this.rag.deleteDocument(target);
          if (result.deleted) {
            return void (await this.replyAndPersist(
              msg,
              sender,
              `🗑️ *Document Deleted Successfully:*\n"${result.title}" and its vector chunks have been removed from PostgreSQL.`,
            ));
          }
          return void (await this.replyAndPersist(
            msg,
            sender,
            `⚠️ Document not found: "${target}". Reply *4* to view available documents.`,
          ));
        } catch (err: unknown) {
          const msgStr = err instanceof Error ? err.message : String(err);
          return void (await this.replyAndPersist(
            msg,
            sender,
            `❌ Failed to delete document: ${msgStr}`,
          ));
        }
      }

      // C. List Documents / Notes Intent
      if (
        /^(?:show|list|view|what\s+are)\s+(?:all\s+)?(?:my\s+)?(?:notes|documents|docs|files|knowledge)(?:\s*\?)?$/i.test(
          text,
        ) ||
        /^(?:my\s+notes|my\s+documents|list\s+docs|all\s+notes|documents)$/i.test(text)
      ) {
        const docs = await this.rag.listDocuments();
        if (docs.length === 0) {
          return void (await this.replyAndPersist(
            msg,
            sender,
            '📂 *Your knowledge base is empty!*\n\nReply *1* to save a note or attach a PDF file to index it.',
          ));
        }
        const docList = docs
          .map((d, i) => `${i + 1}. *${d.title}* (${d.totalChunks} chunks)`)
          .join('\n');
        return void (await this.replyAndPersist(
          msg,
          sender,
          `📚 *Indexed Knowledge Documents (${docs.length}):*\n\n${docList}\n\n` +
            `💡 *To delete any document, simply reply:*\n` +
            `"Delete <number>" (e.g. *Delete 1*) or "Delete <title>"`,
        ));
      }

      // D. Autonomous Research & PDF Generation Intent
      const studyMatch =
        text.match(
          /^(?:please\s+)?(?:create|make|generate)\s+(?:a\s+)?(?:master\s+)?(?:pdf|guide|whitepaper|document)\s+(?:on|about)\s+(.+)$/is,
        ) ||
        text.match(/^(?:please\s+)?(?:research|study)\s+(?:on|about\s+)(.+)$/is) ||
        text.match(/^(?:teach\s+me\s+about|deep\s+dive\s+into)\s+(.+)$/is);

      if (studyMatch && studyMatch[1]) {
        return void (await this.handleStudyAction(msg, sender, studyMatch[1].trim()));
      }

      // E. Clear Chat Intent
      if (
        /^(?:clear|reset|forget)\s+(?:our\s+|my\s+|the\s+)?(?:chat|conversation|memory|history)(?:\s*\?)?$/i.test(
          text,
        ) ||
        /^(?:clear\s+memory|reset\s+chat|forget\s+everything)$/i.test(text)
      ) {
        this.ai.clearHistory(sender);
        this.userStates.delete(sender);
        return void (await this.replyAndPersist(
          msg,
          sender,
          '🧹 *Conversation memory cleared!* Starting a fresh chat session.',
        ));
      }

      // F. Knowledge Recall Question Intent
      const recallMatch = text.match(
        /^(?:what\s+did\s+i\s+note\s+about|what\s+do\s+i\s+have\s+on|do\s+i\s+have\s+(?:a\s+)?note\s+(?:on|about)|search\s+(?:my\s+)?(?:notes|docs|knowledge)\s+(?:for|about)?|check\s+(?:my\s+)?(?:notes|docs)\s+(?:for|about)?)\s+(.+)$/is,
      );

      if (recallMatch && recallMatch[1]) {
        const { answer, sources } = await this.rag.answerWithKnowledge(
          recallMatch[1].trim(),
          sender,
        );
        let replyText = answer;
        if (sources.length > 0) {
          replyText += `\n\n📚 *Sources Cited:*\n${sources.map((s) => `• ${s}`).join('\n')}`;
        }
        return void (await this.replyAndPersist(msg, sender, replyText));
      }

      // --- CLASSIC COMMANDS (Also fully supported) ---

      // Help
      if (text.toLowerCase() === '!help' || text.toLowerCase() === '/help') {
        return void (await this.replyAndPersist(msg, sender, this.getHelpGuide()));
      }

      // Addnote
      if (text.toLowerCase().startsWith('!addnote ') || text.toLowerCase().startsWith('/addnote ')) {
        const fullText = text.replace(/^(!addnote|\/addnote)\s*/i, '').trim();
        const { title, content } = this.parseNote(fullText);

        try {
          const result = await this.rag.indexTextDocument(title, content);
          return void (await this.replyAndPersist(
            msg,
            sender,
            `✅ *Document Indexed Successfully!*\n\n` +
              `📁 *Title:* ${title}\n` +
              `🔢 *Vector Chunks:* ${result.chunkCount} chunks (768 dimensions)\n` +
              `💾 *Database:* Stored in PostgreSQL \`pgvector\`\n\n` +
              `You can now ask questions about it anytime!`,
          ));
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          return void (await this.replyAndPersist(
            msg,
            sender,
            `❌ Failed to index note: ${errorMsg}`,
          ));
        }
      }

      // Deletedoc
      if (text.toLowerCase().startsWith('!deletedoc ') || text.toLowerCase().startsWith('/deletedoc ')) {
        const target = text.replace(/^(!deletedoc|\/deletedoc)\s*/i, '').trim();
        if (!target) {
          return void (await this.replyAndPersist(
            msg,
            sender,
            '⚠️ Please provide the title or ID of the document to delete.\n\n*Example:* `!deletedoc 1` or `!deletedoc notes.pdf`',
          ));
        }

        try {
          const result = await this.rag.deleteDocument(target);
          if (!result.deleted) {
            return void (await this.replyAndPersist(
              msg,
              sender,
              `⚠️ Document not found: "${target}". Reply *4* to view available documents.`,
            ));
          }

          return void (await this.replyAndPersist(
            msg,
            sender,
            `🗑️ *Document Deleted Successfully:*\n"${result.title}" and all its vector chunks have been removed from PostgreSQL.`,
          ));
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          return void (await this.replyAndPersist(
            msg,
            sender,
            `❌ Failed to delete document: ${errorMsg}`,
          ));
        }
      }

      // Clear
      if (text.toLowerCase() === '!clear' || text.toLowerCase() === '/clear') {
        this.ai.clearHistory(sender);
        this.userStates.delete(sender);
        return void (await this.replyAndPersist(
          msg,
          sender,
          '🧹 *Conversation memory cleared!* Starting a fresh chat session.',
        ));
      }

      // Listdocs
      if (text.toLowerCase() === '!listdocs' || text.toLowerCase() === '/listdocs') {
        const docs = await this.rag.listDocuments();
        if (docs.length === 0) {
          return void (await this.replyAndPersist(
            msg,
            sender,
            '📂 *Your knowledge base is empty!*\n\nReply *1* to save a note or attach a PDF to index it.',
          ));
        }
        const docList = docs
          .map((d, i) => `${i + 1}. *${d.title}* (${d.totalChunks} chunks)`)
          .join('\n');
        return void (await this.replyAndPersist(
          msg,
          sender,
          `📚 *Indexed Documents:*\n\n${docList}`,
        ));
      }

      // Study
      if (text.toLowerCase().startsWith('!study ') || text.toLowerCase().startsWith('/study ')) {
        const topic = text.replace(/^(!study|\/study)\s*/i, '').trim();
        return void (await this.handleStudyAction(msg, sender, topic));
      }

      // Ask
      if (text.toLowerCase().startsWith('!ask ') || text.toLowerCase().startsWith('/ask ')) {
        const query = text.replace(/^(!ask|\/ask)\s*/i, '').trim();
        if (!query) {
          return void (await this.replyAndPersist(
            msg,
            sender,
            '⚠️ Please provide a question after !ask.\n*Example:* !ask What is the refund policy?',
          ));
        }

        const { answer, sources } = await this.rag.answerWithKnowledge(query, sender);
        let replyText = answer;
        if (sources.length > 0) {
          replyText += `\n\n📚 *Sources Cited:*\n${sources.map((s) => `• ${s}`).join('\n')}`;
        }
        return void (await this.replyAndPersist(msg, sender, replyText));
      }

      // --- GENERAL AI CHAT (Groq 120B) ---
      const promptToUse = cleanPrompt || text;

      const unknownContext = isUnknownNumber
        ? "NOTE: The sender is an unknown/unsaved contact messaging Soumadeep on WhatsApp. Be polite, helpful, and professional. Let them know you are Soumadeep's AI assistant and can answer questions or take a message for him."
        : undefined;

      let answer = await this.ai.generateAnswer(promptToUse, unknownContext, sender);

      // If it's the very first message from this unknown number, prepend an introduction banner with interactive menu
      if (isFirstMessageFromUnknown) {
        answer =
          `👋 *Hello! I am Soumadeep's AI Assistant (Soumadeep AI).*\n` +
          `Soumadeep may be busy or away right now, but I can help answer questions or take a message for him.\n\n` +
          `${answer}\n\n` +
          this.getInteractiveMenu();
      }

      return void (await this.replyAndPersist(msg, sender, answer));
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Error handling WhatsApp message: ${errorMsg}`);
      return void (await this.replyAndPersist(
        msg,
        sender,
        `❌ Sorry, an error occurred: ${errorMsg}`,
      ));
    }
  }

  private async replyAndPersist(
    msg: Message,
    sender: string,
    replyText: string,
  ): Promise<void> {
    await msg.reply(replyText);
    void this.persistWhatsappMessage(
      sender,
      'ASSISTANT',
      replyText,
      `reply_${Date.now()}`,
      'text',
    );
  }

  private async persistWhatsappMessage(
    senderJid: string,
    role: 'USER' | 'ASSISTANT',
    text: string,
    messageId: string,
    mediaType = 'text',
    senderName?: string,
  ): Promise<void> {
    try {
      // 1. Upsert WhatsappUser
      const user = await this.prisma.whatsappUser.upsert({
        where: { jid: senderJid },
        update: {
          name: senderName ?? undefined,
        },
        create: {
          jid: senderJid,
          name: senderName ?? senderJid.split('@')[0],
          phoneNumber: senderJid.split('@')[0],
        },
      });

      // 2. Upsert WhatsappChat
      const chat = await this.prisma.whatsappChat.upsert({
        where: { chatJid: senderJid },
        update: {
          name: senderName ?? undefined,
        },
        create: {
          chatJid: senderJid,
          name: senderName ?? senderJid.split('@')[0],
          isGroup: false,
        },
      });

      // 3. Create WhatsappMessage
      await this.prisma.whatsappMessage.create({
        data: {
          whatsappChatId: chat.id,
          whatsappUserId: role === 'USER' ? user.id : null,
          messageId,
          role,
          text,
          mediaType,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`⚠️ Failed to persist WhatsApp message to database: ${msg}`);
    }
  }

  onModuleDestroy(): void {
    if (this.client) {
      this.logger.log('Stopping WhatsApp Web Client...');
      void this.client.destroy();
    }
  }
}
