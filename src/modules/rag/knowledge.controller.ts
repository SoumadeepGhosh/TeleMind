import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedUser } from '../auth/auth.types';
import { CreateNoteDto, AskKnowledgeDto } from './knowledge.dto';
import { RagService } from './rag.service';

interface UploadedKnowledgeFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

@UseGuards(AuthGuard('jwt'))
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly rag: RagService) {}

  @Get('documents')
  list(@Req() request: { user: AuthenticatedUser }) {
    return this.rag.listDocuments(request.user.organizationId);
  }

  @Post('notes')
  createNote(@Body() body: CreateNoteDto, @Req() request: { user: AuthenticatedUser }) {
    return this.rag.indexTextDocument(
      body.title,
      body.content,
      'text/plain',
      Buffer.byteLength(body.content, 'utf8'),
      request.user.organizationId,
    );
  }

  @Post('documents/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024, files: 1 },
      fileFilter: (_request, file, callback) => {
        const extension = file.originalname.split('.').pop()?.toLowerCase();
        if (!extension || !['pdf', 'txt', 'md', 'csv', 'json'].includes(extension)) {
          callback(new BadRequestException('Choose a PDF, TXT, Markdown, CSV, or JSON file.'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  uploadDocument(
    @UploadedFile() file: UploadedKnowledgeFile | undefined,
    @Req() request: { user: AuthenticatedUser },
  ) {
    if (!file) {
      throw new BadRequestException('Choose a file to upload.');
    }

    const safeFileName = file.originalname.split(/[\\/]/).pop() || 'uploaded-document';
    return this.rag.indexDocumentFromBuffer(
      safeFileName,
      file.mimetype,
      file.buffer,
      request.user.organizationId,
      request.user.id,
    );
  }

  @Post('ask')
  ask(@Body() body: AskKnowledgeDto, @Req() request: { user: AuthenticatedUser }) {
    return this.rag.answerWithKnowledge(
      body.question,
      undefined,
      request.user.organizationId,
      body.model,
    );
  }

  @Delete('documents/:id')
  delete(@Param('id') id: string, @Req() request: { user: AuthenticatedUser }) {
    return this.rag.deleteDocument(id, request.user.organizationId);
  }
}
