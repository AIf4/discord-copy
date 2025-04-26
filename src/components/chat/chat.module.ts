import { Module } from '@nestjs/common';
import { ChatGateway, ChatService } from '@components/chat';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [ChatGateway, ChatService, PrismaService],
})
export class ChatModule {}
