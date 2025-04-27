import { Module } from '@nestjs/common';

import { PrismaService } from 'src/prisma.service';
import { ChatGateway } from './gateway/chat.gateway';
import { ChatService } from './services/chat.service';

@Module({
  providers: [ChatGateway, ChatService, PrismaService],
})
export class ChatModule {}
