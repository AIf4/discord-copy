import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private logger = new Logger(PrismaService.name);
  constructor() {
    super({
      adapter: new PrismaLibSQL({
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }),
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    //await this.checkLatency();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async checkLatency() {
    const start = Date.now();
    await this.$executeRaw`SELECT 1`;
    const latency = Date.now() - start;
    this.logger.log(`📡 Latencia de conexión: ${latency}ms`);
    return latency;
  }
}
