import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err) {
      // Não derruba o processo se o DB estiver indisponível no boot (serverless).
      this.logger.warn(
        `Não foi possível conectar ao banco no boot: ${(err as Error).message}`,
      );
    }
  }
}
