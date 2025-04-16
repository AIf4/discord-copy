import {
  Controller,
  Post,
  Request,
  UsePipes,
  Body,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, createUserSchema } from 'src/users/dto/user.dto';
import { ZodValidationPipe } from 'src/pipes/zodValidation.pipe';
import { Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('verify-token')
  async verifyToken(@Request() req: any) {
    return this.authService.validateToken(req.body.token);
  }
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req: any, @Res() res: Response) {
    const access_token = await this.authService.generateJwtToken(req.user);
    // Guardar el token en una cookie
    res.cookie('token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Cambia a true si usas HTTPS
      sameSite: 'strict',
    });
    return res.status(200).json({
      message: 'Login successfully',
    });
  }

  @Post('sign-in')
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async signupUser(@Body() userData: CreateUserDto): Promise<any> {
    return this.authService.signIn(userData);
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('access_token');
    return res.status(200).json({
      message: 'Logout successfully',
    });
  }
}
