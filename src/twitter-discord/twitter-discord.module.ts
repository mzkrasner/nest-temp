import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { TwitterService } from './twitter.service';
import { DiscordService } from '@/discord/discord.service';
import { TwitterDiscordService } from './twitter-discord.service';
import { TwitterDiscordController } from './twitter-discord.controller';

@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule],
  providers: [TwitterService, DiscordService, TwitterDiscordService],
  controllers: [TwitterDiscordController],
  exports: [TwitterService, DiscordService, TwitterDiscordService],
})
export class TwitterDiscordModule {}
