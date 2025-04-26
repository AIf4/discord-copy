import { Module } from '@nestjs/common';

import { UsersController, UserService } from '@components/users';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [UsersController],
  providers: [UserService, PrismaService],
  exports: [UserService],
})
export class UsersModule {}
