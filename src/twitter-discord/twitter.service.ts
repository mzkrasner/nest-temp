import { Injectable, Logger } from '@nestjs/common';
import { TwitterApi } from 'twitter-api-v2';
import { ConfigService } from '@nestjs/config';

interface Tweet {
  id: string;
  text: string;
  createdAt: string;
  username: string;
}

@Injectable()
export class TwitterService {
  private twitterClient: TwitterApi;
  private readonly logger = new Logger(TwitterService.name);

  constructor(private configService: ConfigService) {
    const bearerToken = this.configService.get<string>('TWITTER_BEARER_TOKEN');
    if (!bearerToken) {
      throw new Error(
        'TWITTER_BEARER_TOKEN is not set in the environment variables',
      );
    }
    this.twitterClient = new TwitterApi(bearerToken);
  }

  async getLatestTweet(username: string): Promise<Tweet | null> {
    try {
      const user = await this.twitterClient.v2.userByUsername(username);
      if (!user.data) {
        this.logger.error(`User not found: ${username}`);
        return null;
      }

      const tweets = await this.twitterClient.v2.userTimeline(user.data.id, {
        max_results: 5, // We'll always fetch 5 due to API limitations
        'tweet.fields': ['created_at', 'text'],
        exclude: ['replies'],
      });

      if (tweets.data.data.length === 0) {
        this.logger.log(`No tweets found for user: ${username}`);
        return null;
      }

      const latestTweet = tweets.data.data[0];
      return {
        id: latestTweet.id,
        text: latestTweet.text,
        createdAt: latestTweet.created_at,
        username: username,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching tweets for ${username}: ${error.message}`,
      );
      if (error.code === 401) {
        this.logger.error(
          'This could be due to invalid credentials. Please check your TWITTER_BEARER_TOKEN.',
        );
      }
      return null;
    }
  }
}
