import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { StudyService } from './study.service';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { KnowledgeController } from './knowledge.controller';

@Module({
  imports: [AiModule, AuthModule],
  controllers: [KnowledgeController],
  providers: [RagService, StudyService],
  exports: [RagService, StudyService],
})
export class RagModule {}
