import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TwitterService } from './twitter.service';
import { TwitterApi, TweetV2, UserV2Result } from 'twitter-api-v2';

jest.mock('twitter-api-v2');

const MockedTwitterApi = TwitterApi as jest.MockedClass<typeof TwitterApi>;

describe('TwitterService', () => {
  let service: TwitterService;
  let mockConfigService: Partial<ConfigService>;
  let mockTwitterApiInstance: jest.Mocked<TwitterApi>;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn().mockReturnValue('mock-token'),
    };

    mockTwitterApiInstance = {
      v2: {
        userByUsername: jest.fn(),
        userTimeline: jest.fn(),
      },
    } as unknown as jest.Mocked<TwitterApi>;

    MockedTwitterApi.mockImplementation(() => mockTwitterApiInstance);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwitterService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<TwitterService>(TwitterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLatestTweet', () => {
    it('should return the latest tweet', async () => {
      const mockTweet: TweetV2 = {
        id: '123',
        text: 'Test tweet',
        created_at: '2023-05-20T12:00:00.000Z',
        edit_history_tweet_ids: [],
      };

      (mockTwitterApiInstance.v2.userByUsername as jest.Mock).mockResolvedValue(
        {
          data: { id: 'user123' },
        } as UserV2Result,
      );

      (mockTwitterApiInstance.v2.userTimeline as jest.Mock).mockResolvedValue({
        data: {
          data: [mockTweet],
          meta: { result_count: 1 },
        },
      });

      const result = await service.getLatestTweet('testuser');

      expect(result).toEqual({
        id: '123',
        text: 'Test tweet',
        createdAt: '2023-05-20T12:00:00.000Z',
        username: 'testuser',
      });
    });

    it('should return null if no tweets are found', async () => {
      (mockTwitterApiInstance.v2.userByUsername as jest.Mock).mockResolvedValue(
        {
          data: { id: 'user123' },
        } as UserV2Result,
      );

      (mockTwitterApiInstance.v2.userTimeline as jest.Mock).mockResolvedValue({
        data: {
          data: [],
          meta: { result_count: 0 },
        },
      });

      const result = await service.getLatestTweet('testuser');

      expect(result).toBeNull();
    });

    it('should return null if user is not found', async () => {
      (mockTwitterApiInstance.v2.userByUsername as jest.Mock).mockResolvedValue(
        {
          data: null,
        } as UserV2Result,
      );

      const result = await service.getLatestTweet('nonexistentuser');

      expect(result).toBeNull();
    });
  });
});
