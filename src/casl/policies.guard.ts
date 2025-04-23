// casl/policies.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from './casl-ability.factory';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslFactory: CaslAbilityFactory,
  ) {}

  canActivate(ctx: ExecutionContext): boolean {
    /* const handlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        ctx.getHandler(),
      ) || []; */
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    request.ability = this.caslFactory.defineAbility(user);

    /* const isAllowed = handlers.every((handler) => handler(ability));
    if (!isAllowed) {
      throw new ForbiddenException('No tienes permisos suficientes');
    } */
    return true;
  }
}

/* 
// policies.guard.ts
import { ExecutionContext, Injectable, CanActivate } from '@nestjs/common';
import { AbilityFactory } from './ability.factory';
import { Request } from 'express';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(private abilityFactory: AbilityFactory) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as any; // Usuario autenticado

    // Inyectar la habilidad en el request para uso global
    request.ability = this.abilityFactory.createForUser(user);

    return true;
  }
}


*/
