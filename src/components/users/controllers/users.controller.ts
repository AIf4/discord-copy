import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { UserService } from '../services/users.service';
import { ZodValidationPipe } from 'src/pipes/zodValidation.pipe';
import { createUserSchema } from '../dto/user.dto';
import { PermissionsInterceptor, PoliciesGuard } from 'src/casl';
import { JwtAuthGuard } from 'src/components/auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  //@CheckPolicies((ability) => ability.can(Action.CREATE, 'User'))
  @Post()
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async createUser(@Body() user: Prisma.UserCreateInput) {
    try {
      return await this.usersService.createUser(user);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Manejo de otros posibles errores
      throw new BadRequestException('Could not create user.');
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @UseInterceptors(PermissionsInterceptor)
  /*  @CheckPolicies((ability) => ability.can(Action.MANAGE, 'User')) */
  async getUsers() {
    return await this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @UseInterceptors(PermissionsInterceptor)
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findOne(
      { id: parseInt(id) },
      {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    );
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user;
  }

  @Get('find-mail/:email')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @UseInterceptors(PermissionsInterceptor)
  findOneByUsername(@Param('email') email: string) {
    return this.usersService.findOne(
      { email },
      {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    );
  }

  @Patch('update-password/:id')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @UseInterceptors(PermissionsInterceptor)
  async updateUser(
    @Param('id') id: string,
    @Body() user: Prisma.UserUpdateInput,
  ) {
    try {
      return await this.usersService.updateUser({
        where: { id: parseInt(id) },
        data: user,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Manejo de otros posibles errores
      throw new BadRequestException('Could not update user.');
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @UseInterceptors(PermissionsInterceptor)
  async deleteUser(@Param('id') id: string) {
    try {
      return await this.usersService.deleteUser({ id: parseInt(id) });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Manejo de otros posibles errores
      throw new BadRequestException('Could not delete user.');
    }
  }
}
