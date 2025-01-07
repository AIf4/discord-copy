/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private logger = new Logger(JwtAuthGuard.name);
  constructor(private readonly authService: AuthService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies['access_token']; // Obtener el JWT de la cookie

    if (!token) {
      throw new UnauthorizedException('No autenticado');
    }

    const user = this.authService.validateToken(token);

    if (!user) {
      throw new UnauthorizedException('Token inválido');
    }

    // Guardar al usuario en la solicitud para acceder en el controlador
    request.user = user;

    //return super.canActivate(context);
    return true;
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
  }

  handleRequest(err: any, user: any, info: any) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
