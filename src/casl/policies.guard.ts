// casl/policies.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from './casl-ability.factory';
import { CHECK_POLICIES_KEY, PolicyHandler } from './policy.decorator';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslFactory: CaslAbilityFactory,
  ) {}

  canActivate(ctx: ExecutionContext): boolean {
    const handlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        ctx.getHandler(),
      ) || [];
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    const ability = this.caslFactory.defineAbility(user);

    const isAllowed = handlers.every((handler) => handler(ability));
    if (!isAllowed) {
      throw new ForbiddenException('No tienes permisos suficientes');
    }
    return true;
  }
}
