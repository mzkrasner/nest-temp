import { Controller, Get } from '@nestjs/common';
import { TwitterDiscordService } from './twitter-discord.service';

@Controller('twitter-discord')
export class TwitterDiscordController {
  constructor(private twitterDiscordService: TwitterDiscordService) {}

  @Get('check')
  async manualCheck() {
    const result = await this.twitterDiscordService.manualCheckAndPost();
    return { message: result };
  }
}
