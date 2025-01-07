import { Controller, Post, Request, UsePipes, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, createUserSchema } from 'src/users/dto/user.dto';
import { ZodValidationPipe } from 'src/pipes/zodValidation.pipe';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('verify-token')
  async verifyToken(@Request() req: any) {
    return this.authService.validateToken(req.body.token);
  }

  @Post('login')
  async login(@Request() req: any, @Res() res: Response) {
    try {
      const access_token = await this.authService.login(req.body);
      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Cambia a true si usas HTTPS
        sameSite: 'strict',
      });
      return res.status(201).json({
        message: 'User created successfully',
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
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
