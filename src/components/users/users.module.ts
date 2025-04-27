import { Module } from '@nestjs/common';

import { PrismaService } from 'src/prisma.service';
import { UsersController } from './controllers/users.controller';
import { UserService } from './services/users.service';

@Module({
  controllers: [UsersController],
  providers: [UserService, PrismaService],
  exports: [UserService],
})
export class UsersModule {}
