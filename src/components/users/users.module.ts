import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { PrismaService } from 'src/prisma.service';
import { UserService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UserService, PrismaService],
  exports: [UserService],
})
export class UsersModule {}
