import { Module } from '@nestjs/common';
import { ChannelService, ChannelController } from '@components/channel';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ChannelController],
  providers: [ChannelService, PrismaService],
})
export class ChannelModule {}
