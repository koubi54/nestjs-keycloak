import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthUser {
  userId: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    return request.user;
  },
);
