import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(100000)
  content!: string;
}

export class AskKnowledgeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(4000)
  question!: string;

  @IsOptional()
  @IsIn(['groq', 'gemini'])
  model?: 'groq' | 'gemini';
}
