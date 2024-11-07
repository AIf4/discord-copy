import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma.service';
import { ChatModule } from './chat/chat.module';
import { ChannelModule } from './channel/channel.module';

@Module({
  imports: [AuthModule, UsersModule, ChatModule, ChannelModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
