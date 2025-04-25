import { Module } from '@nestjs/common';
import { ChannelService } from './services/channel.service';
import { ChannelController } from './controllers/channel.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ChannelController],
  providers: [ChannelService, PrismaService],
})
export class ChannelModule {}
