import { Module } from '@nestjs/common';
import { AuthModule } from '@components/auth';
import { ChannelModule } from '@components/channel';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma.service';
import { ChatModule } from './chat/chat.module';
import { CaslModule } from './casl/casl.module';
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
