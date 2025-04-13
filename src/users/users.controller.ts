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
import { Roles } from 'src/decorators/roles.decorator';
import { Action, Role } from 'src/utils/global.enum';
import { UserService } from './users.service';
import { CheckPolicies } from 'src/casl/policy.decorator';
import { Prisma } from '@prisma/client';
import { createUserSchema } from './dto/user.dto';
import { ZodValidationPipe } from 'src/pipes/zodValidation.pipe';

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
  @UseGuards(JwtAuthGuard)
  @CheckPolicies((ability) => ability.can(Action.READ, 'User'))
  async getUsers() {
    return await this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @CheckPolicies((ability) => ability.can(Action.READ, 'User'))
  async getUserById(@Param('id') id: string) {
    return await this.usersService.findOne({ id: parseInt(id) });
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.DEFAULT)
  @Get(':email')
  findOneByUsername(@Param('email') email: string) {
    return this.usersService.findOne({ email });
  }
}
