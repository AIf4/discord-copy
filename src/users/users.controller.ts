import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Action, Role } from 'src/utils/global.enum';
import { UserService } from './users.service';
import { CheckPolicies } from 'src/casl/policy.decorator';
import { Prisma } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  //@CheckPolicies((ability) => ability.can(Action.CREATE, 'User'))
  @Post()
  //@UseGuards(JwtAuthGuard)
  async createUser(@Body() user: Prisma.UserCreateInput) {
    return await this.usersService.createUser(user);
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
