import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap(): Promise<void> {
  const logger = new Logger('TeleMindBootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.port;

  app.setGlobalPrefix('api/v1', {
    exclude: ['admin/queues', 'admin/queues/(.*)'],
  });
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useStaticAssets(join(process.cwd(), 'web'));

  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 TeleMind is running on: http://localhost:${port}/api/v1`);
  logger.log(`📊 Bull-Board Queue Dashboard: http://localhost:${port}/admin/queues`);
}

void bootstrap();
