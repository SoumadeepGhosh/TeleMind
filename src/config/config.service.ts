import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class ConfigService {
  readonly port = parseInt(process.env['PORT'] || '3060', 10);
  readonly nodeEnv = process.env['NODE_ENV'] || 'development';
  readonly databaseUrl = process.env['DATABASE_URL'] || '';
  readonly redisUrl = process.env['REDIS_URL'] || 'redis://localhost:6379';
  readonly telegramToken = process.env['TELEGRAM_BOT_TOKEN'] || '';
  readonly geminiApiKey = process.env['GEMINI_API_KEY'] || '';
  readonly geminiModel = process.env['GEMINI_MODEL'] || 'gemini-3.5-flash';
  readonly groqApiKey = process.env['GROQ_API_KEY'] || '';
  readonly groqModel = process.env['GROQ_MODEL'] || 'openai/gpt-oss-120b';
  readonly jwtSecret = process.env['JWT_SECRET'] || 'default-secret-change-in-production';
}
