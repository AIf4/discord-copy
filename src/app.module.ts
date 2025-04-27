import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './components/auth';
import { UsersModule } from './components/users';
import { ChatModule } from './components/chat';
import { ChannelModule } from './components/channel';
import { CaslModule } from './casl';

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
