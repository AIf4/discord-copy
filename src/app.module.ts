import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '@components/auth/auth.module';
import { UsersModule } from '@components/users/users.module';
import { ChatModule } from '@components/chat/chat.module';
import { ChannelModule } from '@components/channel/channel.module';
import { CaslModule } from '@ccasl/casl.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    ChatModule,
    ChannelModule,
    CaslModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
