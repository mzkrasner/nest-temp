import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from '@/users/users.module';
import { UsersController } from '@/users/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DiscordModule } from '@/discord/discord.module';
import { DiscordController } from '@/discord/discord.controller';
import { TwitterDiscordModule } from '@/twitter-discord/twitter-discord.module';
import { TwitterDiscordController } from '@/twitter-discord/twitter-discord.controller';

@Module({
  imports: [
    UsersModule,
    DiscordModule,
    TwitterDiscordModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Set to false in production
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AppController,
    DiscordController,
    UsersController,
    TwitterDiscordController,
  ],
  providers: [AppService],
})
export class AppModule {}
