/* eslint-disable @typescript-eslint/no-unused-vars */
import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { User } from '@prisma/client';
import { UserService } from '@components/users/services/users.service';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateToken(token: string) {
    try {
      const req_token = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      const { email, sub } = req_token;
      return { email: email, id: sub };
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne({ email });
    if (user && bcrypt.compareSync(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async generateJwtToken(user: Pick<User, 'email' | 'id' | 'role'>) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRATION_TIME || '60m',
    });
  }

  async signIn(user: any) {
    return await this.usersService.createUser(user);
  }
}
