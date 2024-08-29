import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecureDomainGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const origin = request.headers.origin;
    const timestamp = request.headers['x-timestamp'];
    const signature = request.headers['x-signature'];

    if (!origin || !timestamp || !signature) {
      throw new UnauthorizedException('Missing required headers');
    }

    const allowedDomain = this.configService.get<string>('ALLOWED_DOMAIN');
    const secretKey = this.configService.get<string>('SECRET_KEY');

    if (!allowedDomain || !secretKey) {
      console.error('ALLOWED_DOMAIN or SECRET_KEY not configured');
      return false;
    }

    if (origin !== allowedDomain) {
      throw new UnauthorizedException('Invalid origin');
    }

    const data = `${origin}${timestamp}`;
    const expectedSignature = createHmac('sha256', secretKey)
      .update(data)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new UnauthorizedException('Invalid signature');
    }

    // Check if the timestamp is within a reasonable time window (e.g., 5 minutes)
    const timestampDate = new Date(parseInt(timestamp));
    const now = new Date();
    if (now.getTime() - timestampDate.getTime() > 5 * 60 * 1000) {
      throw new UnauthorizedException('Request expired');
    }

    return true;
  }
}
