import { Module } from '@nestjs/common';

import { PrismaService } from 'src/prisma.service';
import { ChannelService } from './services/channel.service';
import { ChannelController } from './controllers/channel.controller';

@Module({
  controllers: [ChannelController],
  providers: [ChannelService, PrismaService],
})
export class ChannelModule {}
