import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Action } from 'src/utils/global.enum';
import { UserService } from './users.service';
import { CheckPolicies } from 'src/casl/policy.decorator';
import { Prisma } from '@prisma/client';
import { createUserSchema } from './dto/user.dto';
import { ZodValidationPipe } from 'src/pipes/zodValidation.pipe';
import { PoliciesGuard } from 'src/casl/policies.guard';

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
  @CheckPolicies((ability) => ability.can(Action.MANAGE, 'User'))
  async getUsers() {
    return await this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.MANAGE, 'User'))
  async getUserById(@Param('id') id: string) {
    return await this.usersService.findOne({ id: parseInt(id) });
  }

  @Get(':email')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.READ, 'User'))
  findOneByUsername(@Param('email') email: string) {
    return this.usersService.findOne({ email });
  }
}
