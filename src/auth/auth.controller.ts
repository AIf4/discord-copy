import {
  Controller,
  Post,
  UseGuards,
  Request,
  UsePipes,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateUserDto, createUserSchema } from 'src/users/dto/user.dto';
import { ZodValidationPipe } from 'src/pipes/zodValidation.pipe';
import { Users } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @Post('sign-in')
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async signupUser(@Body() userData: CreateUserDto): Promise<Users> {
    return this.authService.signIn(userData);
  }
}
