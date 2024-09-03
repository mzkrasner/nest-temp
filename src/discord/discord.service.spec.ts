import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DiscordService } from './discord.service';
import { Client, Guild, Collection, GuildMember, Role, User } from 'discord.js';

jest.mock('discord.js', () => {
  const original = jest.requireActual('discord.js');
  return {
    ...original,
    Client: jest.fn().mockImplementation(() => ({
      login: jest.fn().mockResolvedValue('token'),
      guilds: {
        fetch: jest.fn(),
      },
    })),
    GatewayIntentBits: {
      Guilds: 'Guilds',
      GuildMembers: 'GuildMembers',
    },
  };
});

describe('DiscordService', () => {
  let service: DiscordService;
  let mockClient: jest.Mocked<Client>;
  let mockGuild: jest.Mocked<Guild>;

  beforeEach(async () => {
    mockClient = new Client({ intents: [] }) as jest.Mocked<Client>;
    mockGuild = {
      members: {
        fetch: jest.fn(),
        cache: new Collection<string, GuildMember>(),
      },
    } as unknown as jest.Mocked<Guild>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscordService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DiscordService>(DiscordService);

    // Manually set the client and guild on the service
    service['client'] = mockClient;
    service['guild'] = mockGuild;
  });

  describe('getUsersAndRoles', () => {
    it('should return users and their roles', async () => {
      const mockUser1 = { username: 'user1', discriminator: '1234' } as User;
      const mockUser2 = { username: 'user2', discriminator: '5678' } as User;
      const mockRole1 = { name: 'Role1' } as Role;
      const mockRole2 = { name: 'Role2' } as Role;
      const mockRole3 = { name: 'Role3' } as Role;

      const mockMembersCache = new Collection<string, GuildMember>([
        [
          '1',
          {
            user: mockUser1,
            roles: {
              cache: new Collection<string, Role>([
                ['1', mockRole1],
                ['2', mockRole2],
              ]),
            },
          } as GuildMember,
        ],
        [
          '2',
          {
            user: mockUser2,
            roles: { cache: new Collection<string, Role>([['3', mockRole3]]) },
          } as GuildMember,
        ],
      ]);

      mockGuild.members = {
        fetch: jest.fn().mockResolvedValue(undefined),
        cache: mockMembersCache,
      } as any;

      const result = await service.getUsersAndRoles();

      expect(result).toEqual([
        { user: 'user1#1234', roles: ['Role1', 'Role2'] },
        { user: 'user2#5678', roles: ['Role3'] },
      ]);
    });

    it('should filter out @everyone role', async () => {
      const mockUser = { username: 'user', discriminator: '1234' } as User;
      const mockRole1 = { name: 'Role1' } as Role;
      const mockRoleEveryone = { name: '@everyone' } as Role;

      const mockMembersCache = new Collection<string, GuildMember>([
        [
          '1',
          {
            user: mockUser,
            roles: {
              cache: new Collection<string, Role>([
                ['1', mockRole1],
                ['2', mockRoleEveryone],
              ]),
            },
          } as GuildMember,
        ],
      ]);

      mockGuild.members = {
        fetch: jest.fn().mockResolvedValue(undefined),
        cache: mockMembersCache,
      } as any;

      const result = await service.getUsersAndRoles();

      expect(result).toEqual([{ user: 'user#1234', roles: ['Role1'] }]);
    });

    it('should handle errors when fetching members', async () => {
      mockGuild.members.fetch = jest
        .fn()
        .mockRejectedValue(new Error('Fetch failed'));

      await expect(service.getUsersAndRoles()).rejects.toThrow('Fetch failed');
    });
  });

  describe('getRolesByUserId', () => {
    it('should return roles for a valid user', async () => {
      const userId = '123456789';
      const mockMember = {
        roles: {
          cache: new Collection([
            ['1', { name: 'Role1' } as Role],
            ['2', { name: 'Role2' } as Role],
            ['3', { name: '@everyone' } as Role],
          ]),
        },
      } as GuildMember;

      (mockGuild.members.fetch as jest.Mock).mockResolvedValue(mockMember);

      const result = await service.getRolesByUserId(userId);
      expect(result).toEqual(['Role1', 'Role2']);
    });

    it('should return null for an invalid user', async () => {
      const userId = 'invalidUser';
      (mockGuild.members.fetch as jest.Mock).mockRejectedValue(
        new Error('User not found'),
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await service.getRolesByUserId(userId);
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching roles for user invalidUser:',
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });

    it('should handle unexpected errors when fetching user', async () => {
      const userId = '123456789';
      (mockGuild.members.fetch as jest.Mock).mockRejectedValue(
        new Error('Unexpected error'),
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await service.getRolesByUserId(userId);
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching roles for user 123456789:',
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });
});
