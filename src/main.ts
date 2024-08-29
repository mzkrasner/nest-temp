import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>('ALLOWED_DOMAIN'),
    methods: ['GET', 'HEAD', 'OPTIONS'],
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
