import { Module } from '@nestjs/common';
import { AuthModule } from '@components/auth';
import { ChannelModule } from '@components/channel';
import { UsersModule } from '@components/users';
import { PrismaService } from './prisma.service';
import { ChatModule } from '@components/chat';
import { CaslModule } from '@casl/casl.module';
import { ConfigModule } from '@nestjs/config';

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
