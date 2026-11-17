import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { StudyService } from './study.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  providers: [RagService, StudyService],
  exports: [RagService, StudyService],
})
export class RagModule {}
