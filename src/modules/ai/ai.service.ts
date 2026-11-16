import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '../../config/config.service';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI?: GoogleGenerativeAI;

  constructor(private readonly config: ConfigService) {
    if (this.config.groqApiKey) {
      this.logger.log(`⚡ Groq AI initialized with model: ${this.config.groqModel} (14,400 free reqs/day)`);
    }

    if (this.config.geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(this.config.geminiApiKey);
      this.logger.log(`🤖 Gemini AI initialized with model: ${this.config.geminiModel}`);
    } else {
      this.logger.warn('⚠️ GEMINI_API_KEY is not set. Vector embeddings may be disabled.');
    }
  }

  // In-memory chat history map: key = Chat ID, value = recent messages
  private readonly chatHistories = new Map<string, ChatMessage[]>();

  /**
   * Clears conversation history for a chat
   */
  clearHistory(chatId: string): void {
    this.chatHistories.delete(chatId);
  }

  /**
   * Generates natural language answer using Groq (Llama 3.3 70B - 14,400 free reqs/day)
   * with automatic fallback to Gemini.
   */
  async generateAnswer(prompt: string, context?: string, chatId?: string): Promise<string> {
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const systemPrompt = context
      ? `You are Soumadeep AI, an intelligent, helpful, and friendly personal AI knowledge and voice assistant.\nCurrent Date: ${currentDate}.\nHere is private context from the user's documents:\n"""\n${context}\n"""\nAnswer accurately based on this context. If the context does not contain the answer, say so politely.`
      : `You are Soumadeep AI, an intelligent, helpful, and friendly personal AI knowledge and voice assistant.\nCurrent Date: ${currentDate}.`;

    // 1. Prioritize Groq (High Speed Llama 3.3 70B - 14,400 free requests per day)
    if (this.config.groqApiKey) {
      try {
        const history = (chatId ? this.chatHistories.get(chatId) : []) || [];

        const messages: Array<{ role: string; content: string }> = [
          { role: 'system', content: systemPrompt },
          ...history.map((h) => ({
            role: h.role === 'model' ? 'assistant' : 'user',
            content: h.parts[0]?.text || '',
          })),
          { role: 'user', content: prompt },
        ];

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.groqApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.config.groqModel,
            messages,
            temperature: 0.7,
            max_tokens: 1024,
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Groq API returned ${res.status}: ${errText}`);
        }

        const data = (await res.json()) as { choices: Array<{ message: { content: string } }> };
        const responseText = data.choices[0]?.message?.content?.trim() || 'No response generated.';

        // Save conversation history
        if (chatId) {
          history.push(
            { role: 'user', parts: [{ text: prompt }] },
            { role: 'model', parts: [{ text: responseText }] },
          );
          this.chatHistories.set(chatId, history.slice(-10));
        }

        return responseText;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.logger.error(`Groq error, attempting Gemini fallback: ${errorMsg}`);
      }
    }

    // 2. Gemini Fallback
    if (!this.genAI) {
      return '⚠️ Neither Groq nor Gemini API key is configured on the server.';
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: this.config.geminiModel });
      const fullPrompt = context
        ? `${systemPrompt}\n\nUser Question: ${prompt}`
        : prompt;

      if (chatId) {
        const history = this.chatHistories.get(chatId) || [];
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(fullPrompt);
        const responseText = result.response.text().trim();

        history.push(
          { role: 'user', parts: [{ text: fullPrompt }] },
          { role: 'model', parts: [{ text: responseText }] },
        );
        this.chatHistories.set(chatId, history.slice(-10));
        return responseText;
      }

      const result = await model.generateContent(fullPrompt);
      return result.response.text().trim();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Error generating answer from Gemini: ${errorMsg}`);
      return `❌ Sorry, I encountered an issue generating a response: ${errorMsg}`;
    }
  }

  /**
   * Transcribes incoming voice notes / audio into text using Groq Whisper (whisper-large-v3-turbo)
   */
  async transcribeAudio(audioBuffer: Buffer, mimeType = 'audio/mp3'): Promise<string> {
    if (!this.config.groqApiKey) {
      throw new Error('Groq API Key is not configured for audio transcription.');
    }

    try {
      const ext = mimeType.includes('ogg') ? 'ogg' : mimeType.includes('m4a') ? 'm4a' : 'mp3';
      const form = new FormData();
      form.append('file', new Blob([new Uint8Array(audioBuffer)], { type: mimeType }), `voice.${ext}`);
      form.append('model', 'whisper-large-v3-turbo');

      const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.groqApiKey}`,
        },
        body: form,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Whisper transcription error (${res.status}): ${errText}`);
      }

      const data = (await res.json()) as { text?: string };
      return data.text?.trim() || '';
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Error transcribing audio: ${errorMsg}`);
      throw err;
    }
  }

  /**
   * Synthesizes text into high-quality spoken audio using Neural TTS
   * Returns base64-encoded MP3 audio string.
   */
  async generateSpeechAudio(text: string, lang = 'en'): Promise<string> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const googleTTS = require('google-tts-api');
      // Truncate to first 250 characters for snappy voice replies
      const spokenText = text.length > 250 ? text.substring(0, 247) + '...' : text;
      // Strip formatting symbols so speech flows naturally
      const cleanText = spokenText.replace(/[*_`#]/g, '').trim();

      const base64Audio = await googleTTS.getAudioBase64(cleanText, {
        lang,
        slow: false,
        host: 'https://translate.google.com',
        timeout: 10000,
      });

      return base64Audio;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Error generating speech audio: ${errorMsg}`);
      throw err;
    }
  }

  /**
   * Converts text into a 768-dimensional dense vector for pgvector storage & search
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.genAI) {
      throw new Error('Gemini API key is not configured on the server.');
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
      const result = await model.embedContent({
        content: { role: 'user', parts: [{ text }] },
        outputDimensionality: 768,
      } as any);

      return result.embedding.values;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Error generating embedding: ${errorMsg}`);
      throw err;
    }
  }
}
