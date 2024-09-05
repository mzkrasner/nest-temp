// src/twitter-discord/twitter-discord.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TwitterService } from './twitter.service';
import { DiscordService } from '@/discord/discord.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwitterDiscordService {
  private readonly logger = new Logger(TwitterDiscordService.name);

  constructor(
    private twitterService: TwitterService,
    private discordService: DiscordService,
    private configService: ConfigService,
  ) {}

  @Cron('*/15 * * * *')
  async checkAndPostTweets() {
    const twitterUsername = this.configService.get<string>('TWITTER_USERNAME');
    const discordChannelId =
      this.configService.get<string>('DISCORD_CHANNEL_ID');

    if (!twitterUsername || !discordChannelId) {
      this.logger.error(
        'TWITTER_USERNAME or DISCORD_CHANNEL_ID is not set in the environment variables',
      );
      return;
    }

    const latestTweet =
      await this.twitterService.getLatestTweet(twitterUsername);

    if (!latestTweet) {
      this.logger.log('No tweet found or error occurred');
      return;
    }

    const latestMessage =
      await this.discordService.getLatestMessage(discordChannelId);

    if (latestMessage) {
      const lastPostedTweetId = this.extractTweetIdFromUrl(
        latestMessage.content,
      );
      if (lastPostedTweetId === latestTweet.id) {
        this.logger.log('Latest tweet already posted');
        return;
      }
    }

    // Construct the tweet URL
    const tweetUrl = `https://twitter.com/${latestTweet.username}/status/${latestTweet.id}`;

    // Construct the simplified message
    const message = `New tweet from ${latestTweet.username}:\n${tweetUrl}`;

    await this.discordService.sendMessage(discordChannelId, message);
    this.logger.log(`Posted new tweet: ${latestTweet.id}`);
  }
  catch(error) {
    if (error instanceof Error) {
      if (error.message.includes('Twitter')) {
        this.logger.error(`Error fetching tweets: ${error.message}`);
      } else {
        this.logger.error(`Error posting to Discord: ${error.message}`);
      }
    } else {
      this.logger.error('An unexpected error occurred');
    }
  }

  async manualCheckAndPost(): Promise<string> {
    await this.checkAndPostTweets();
    return 'Manual check and post completed';
  }

  private extractTweetIdFromUrl(message: string): string | null {
    const urlMatch = message.match(
      /https:\/\/twitter\.com\/\w+\/status\/(\d+)/,
    );
    return urlMatch ? urlMatch[1] : null;
  }
}
