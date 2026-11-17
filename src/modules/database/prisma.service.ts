import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, UserRole } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    await this.$connect();
    await this.seedDefaults();
  }

  private async seedDefaults(): Promise<void> {
    try {
      // 1. Ensure a default admin user exists
      const userCount = await this.user.count();
      let defaultUser;
      if (userCount === 0) {
        defaultUser = await this.user.create({
          data: {
            email: 'soumadeep@telemind.ai',
            fullName: 'Soumadeep Admin',
            passwordHash: '$2b$10$defaultPlaceholderHashForInitialAdminUser123',
            role: UserRole.SUPER_ADMIN,
          },
        });
        this.logger.log('👤 Initial admin user created: soumadeep@telemind.ai');
      } else {
        defaultUser = await this.user.findFirst();
      }

      // 2. Ensure a default KnowledgeBase exists
      const defaultKb = await this.knowledgeBase.upsert({
        where: { slug: 'default' },
        update: {},
        create: {
          name: 'Main Knowledge Base',
          slug: 'default',
          description: 'Primary repository for private documents and vector embeddings',
        },
      });

      // 3. Link any existing documents that don't have knowledgeBaseId or uploadedById
      await this.document.updateMany({
        where: { knowledgeBaseId: null },
        data: {
          knowledgeBaseId: defaultKb.id,
          uploadedById: defaultUser ? defaultUser.id : undefined,
        },
      });

      // 4. Ensure an initial system audit log exists
      const auditCount = await this.auditLog.count();
      if (auditCount === 0) {
        await this.auditLog.create({
          data: {
            userId: defaultUser ? defaultUser.id : undefined,
            action: 'SYSTEM_INITIALIZED',
            resource: 'System',
            details: { note: 'TeleMind database and pgvector persistence ready' },
          },
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`⚠️ Error in seedDefaults: ${msg}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
