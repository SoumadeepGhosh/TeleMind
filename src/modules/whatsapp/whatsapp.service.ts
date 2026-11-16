import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client, LocalAuth, Message, MessageMedia } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import { AiService } from '../ai/ai.service';
import { RagService } from '../rag/rag.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DOCUMENT_QUEUE_NAME } from '../queue/queue.module';

@Injectable()
export class WhatsappService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsappService.name);
  private client!: Client;

  constructor(
    private readonly ai: AiService,
    private readonly rag: RagService,
    @InjectQueue(DOCUMENT_QUEUE_NAME) private readonly docQueue: Queue,
  ) {}

  onModuleInit(): void {
    this.logger.log('📱 Initializing WhatsApp Web Client...');

    const chromePath =
      process.env.CHROME_BIN ||
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

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
      this.logger.log('🔑 WhatsApp authentication successful! Session stored in .wwebjs_auth.');
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

    // ⛔ RULE 1: 100% BAN ALL GROUPS (Never process or reply to any group under any circumstance!)
    if (sender.endsWith('@g.us') || msg.to?.endsWith('@g.us')) {
      return;
    }

    // 🔒 RULE 2: In personal chats, ONLY respond if the message explicitly starts with @ai or !ask/!help
    const hasAiTrigger =
      text.toLowerCase().startsWith('@ai') ||
      text.toLowerCase().startsWith('!ai') ||
      text.toLowerCase().startsWith('/ai') ||
      text.toLowerCase().startsWith('!ask') ||
      text.toLowerCase().startsWith('/ask') ||
      text.toLowerCase().startsWith('!help') ||
      text.toLowerCase().startsWith('/help') ||
      text.toLowerCase().startsWith('!listdocs') ||
      text.toLowerCase().startsWith('/listdocs') ||
      text.toLowerCase().startsWith('!clear') ||
      text.toLowerCase().startsWith('/clear');

    // If it doesn't have @ai trigger and isn't a direct voice note in self-chat, IGNORE IT!
    const isSelfChat = msg.fromMe && this.client.info && msg.to === this.client.info.wid._serialized;
    if (!hasAiTrigger && !isSelfChat) {
      return; // Stay 100% silent! Leave normal chats completely alone.
    }

    // In self chat, if text does not start with @ai and is not a command, ignore normal text
    if (!hasAiTrigger && !msg.hasMedia) {
      return;
    }

    this.logger.log(`📩 Soumadeep AI triggered in personal chat from ${sender}: "${text}"`);

    // Clean @ai prefix if present
    let cleanPrompt = text;
    if (
      text.toLowerCase().startsWith('@ai') ||
      text.toLowerCase().startsWith('!ai') ||
      text.toLowerCase().startsWith('/ai')
    ) {
      cleanPrompt = text.replace(/^(@ai|!ai|\/ai)\s*/i, '').trim();
    }

    try {
      // 1. Voice Notes & Audio Messages (Only in private self-chat)
      if (msg.hasMedia && (msg.type === 'ptt' || msg.type === 'audio')) {
        const media = await msg.downloadMedia();
        if (media && media.data) {
          const audioBuffer = Buffer.from(media.data, 'base64');
          this.logger.log(`🎙️ Received voice note from ${sender}, transcribing with Groq Whisper...`);

          const transcription = await this.ai.transcribeAudio(audioBuffer, media.mimetype || 'audio/ogg');
          this.logger.log(`📝 Transcribed text: "${transcription}"`);

          if (!transcription) {
            return void msg.reply('⚠️ Could not clearly hear the voice message. Please try speaking again.');
          }

          // Generate answer with Soumadeep AI (Groq 120B)
          const answer = await this.ai.generateAnswer(transcription, undefined, sender);

          // Synthesize spoken voice note
          try {
            const speechBase64 = await this.ai.generateSpeechAudio(answer);
            const voiceMedia = new MessageMedia('audio/mp3', speechBase64, 'soumadeep_ai_reply.mp3');
            await msg.reply(voiceMedia, undefined, { sendAudioAsVoice: true });
          } catch (audioErr) {
            this.logger.warn(`Could not synthesize voice reply: ${audioErr}`);
          }

          // Also reply with text transcription and answer
          return void msg.reply(
            `🎙️ *You said:* "${transcription}"\n\n🤖 *Soumadeep AI:*\n${answer}`,
          );
        }
      }

      // 2. Document attachments (Only in private self-chat, never in groups!)
      if (msg.hasMedia) {
        if (!isSelfChat) {
          return; // Ignore files sent by others in groups
        }

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

          this.logger.log(`📥 Added WhatsApp document "${fileName}" to BullMQ Queue (Job ID: ${job.id})`);

          return void msg.reply(
            `⚡ *Document Queued in Background! (Job #${job.id})*\n\n` +
              `📄 *File:* ${fileName}\n` +
              `⚙️ *Status:* BullMQ worker is parsing & embedding into PostgreSQL \`pgvector\`...\n\n` +
              `You can ask questions about it using *!ask <question>* in a few seconds!`,
          );
        }
      }

      // B. Command: !help or /help
      if (text.toLowerCase() === '!help' || text.toLowerCase() === '/help') {
        return void msg.reply(
          `📖 *TeleMind WhatsApp AI Assistant*\n\n` +
            `• *!ask <query>* - Search private knowledge & answer with citations\n` +
            `• *!clear* - Reset conversation memory\n` +
            `• *!listdocs* - View all indexed documents\n` +
            `• Send any PDF or document to index it into pgvector\n` +
            `• Send any normal text message to chat with Gemini AI!`,
        );
      }

      // C. Command: !clear or /clear
      if (text.toLowerCase() === '!clear' || text.toLowerCase() === '/clear') {
        this.ai.clearHistory(sender);
        return void msg.reply('🧹 *Conversation memory cleared!* Starting a fresh chat session.');
      }

      // D. Command: !listdocs or /listdocs
      if (text.toLowerCase() === '!listdocs' || text.toLowerCase() === '/listdocs') {
        const docs = await this.rag.listDocuments();
        if (docs.length === 0) {
          return void msg.reply('📂 Knowledge base is empty! Send a PDF to index it.');
        }
        const docList = docs
          .map((d, i) => `${i + 1}. *${d.title}* (${d.totalChunks} chunks)`)
          .join('\n');
        return void msg.reply(`📚 *Indexed Documents:*\n\n${docList}`);
      }

      // E. Command: !ask <query> (RAG Vector Search)
      if (text.toLowerCase().startsWith('!ask ') || text.toLowerCase().startsWith('/ask ')) {
        const query = text.replace(/^(!ask|\/ask)\s*/i, '').trim();
        if (!query) {
          return void msg.reply(
            '⚠️ Please provide a question after !ask.\n*Example:* !ask What is the refund policy?',
          );
        }

        const { answer, sources } = await this.rag.answerWithKnowledge(query, sender);
        let replyText = answer;
        if (sources.length > 0) {
          replyText += `\n\n📚 *Sources Cited:*\n${sources.map((s) => `• ${s}`).join('\n')}`;
        }
        return void msg.reply(replyText);
      }

      // F. Generic Text / @ai Queries -> Soumadeep AI (Groq 120B) with Conversation Memory
      const answer = await this.ai.generateAnswer(cleanPrompt, undefined, sender);
      return void msg.reply(answer);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Error handling WhatsApp message: ${errorMsg}`);
      return void msg.reply(`❌ Sorry, an error occurred: ${errorMsg}`);
    }
  }

  onModuleDestroy(): void {
    if (this.client) {
      this.logger.log('Stopping WhatsApp Web Client...');
      void this.client.destroy();
    }
  }
}
