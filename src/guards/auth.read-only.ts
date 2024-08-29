import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class ReadOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      throw new ForbiddenException('Only read operations are allowed');
    }
    return true;
  }
}
