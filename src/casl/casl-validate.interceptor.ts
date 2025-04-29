import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
  Logger,
} from '@nestjs/common'; // Importa Logger
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppAbility } from './casl-ability.factory';
import { Request } from 'express';
import { Action } from '@utils/global.enum';
import { subject } from '@casl/ability';

@Injectable()
export class PermissionsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PermissionsInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const ability: AppAbility = (request as any).ability;

    if (!ability) {
      this.logger.error(
        'Ability not found on request. Ensure PoliciesGuard runs before this interceptor.',
      );
      throw new ForbiddenException('Error interno al verificar permisos.');
    }

    const resourceType = this.getResourceType(context);
    // Si no se pudo determinar el tipo de recurso, es un error de configuración
    if (!resourceType) {
      this.logger.error(
        `Could not determine resource type for controller ${context.getClass().name}`,
      );
      throw new ForbiddenException('Error interno al configurar permisos.');
    }

    this.logger.debug(
      `Checking permissions for resource type: ${resourceType}`,
    ); // Log para ver qué tipo se infirió

    return next.handle().pipe(
      tap((data) => {
        if (!data) {
          this.logger.debug(
            'No data returned from handler, skipping permission check.',
          );
          return;
        }
        const resourceSubject = subject(resourceType, data);

        // Asegúrate de que 'data' sea un objeto antes de pasarlo a 'subject'
        // Si 'data' es un array (ej: findAll), este interceptor no aplicaría directamente
        // a cada elemento. Este interceptor está pensado para rutas que devuelven UN objeto.
        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
          this.logger.warn(
            `Data returned is not a single object (${typeof data}). Skipping detailed permission check.`,
          );
          // Si el usuario no tiene permisos para leer todos los recursos de ese tipo,
          // entonces no debería poder ver ninguno de ellos.
          if (ability.cannot(Action.READ, resourceSubject)) {
            this.logger.warn(
              `Forbidden: User lacks permission to ${Action.READ} ${resourceType} (ID: ${data.id ?? 'N/A'})`,
            );
            throw new ForbiddenException(
              `No tienes permiso para ver este recurso (${resourceType}).`,
            );
          }

          return;
        }

        this.logger.debug(
          `Checking ability: cannot ${Action.READ} on ${resourceType} with data ID: ${data.id ?? 'N/A'}`,
        );

        if (ability.cannot(Action.READ, resourceSubject)) {
          this.logger.warn(
            `Forbidden: User lacks permission to ${Action.READ} ${resourceType} (ID: ${data.id ?? 'N/A'})`,
          );
          throw new ForbiddenException(
            `No tienes permiso para ver este recurso (${resourceType}).`,
          );
        }

        this.logger.debug(
          `Allowed: User has permission to ${Action.READ} ${resourceType} (ID: ${data.id ?? 'N/A'})`,
        );
      }),
    );
  }

  private getResourceType(context: ExecutionContext): string | undefined {
    const controllerClass = context.getClass();
    const controllerName = controllerClass.name.replace('Controller', ''); // "Users"

    // Intenta singularizar quitando la 's' final.
    // Esto es básico y puede fallar con plurales irregulares (ej: People)
    // o palabras que terminan en 's' pero son singulares (ej: Status).
    if (controllerName.length > 1 && controllerName.endsWith('s')) {
      // Añade excepciones si es necesario:
      // if (controllerName === 'Status') return 'Status';
      return controllerName.slice(0, -1); // "Users" -> "User"
    }

    // Si no termina en 's', asume que ya está en singular o es un caso especial
    // Podrías añadir un mapeo explícito aquí si la convención no es suficiente:
    // const map = { Auth: 'Auth', Profile: 'User' /* ... */ };
    // if (map[controllerName]) return map[controllerName];

    // Devuelve el nombre si no termina en 's' o es muy corto
    if (controllerName.length > 0) {
      return controllerName;
    }

    // No se pudo determinar
    return undefined;
  }
}
