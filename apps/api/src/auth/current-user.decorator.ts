import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from './jwt.strategy';

/**
 * Injeta o usuário autenticado (resolvido pela JwtStrategy) no handler.
 * Uso: `@CurrentUser() user: RequestUser`
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as RequestUser;
  },
);
