import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: Error | null, user: any): any {
    if (err || !user) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
    return user;
  }
}
