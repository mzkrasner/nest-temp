import { Test, TestingModule } from '@nestjs/testing';
import { DiscordController } from './discord.controller';
import { DiscordService } from './discord.service';

describe('DiscordController', () => {
  let controller: DiscordController;
  let service: jest.Mocked<DiscordService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscordController],
      providers: [
        {
          provide: DiscordService,
          useValue: {
            getUsersAndRoles: jest.fn(),
            getRolesByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DiscordController>(DiscordController);
    service = module.get(DiscordService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsersAndRoles', () => {
    it('should return an array of users and their roles', async () => {
      const result = [
        { user: 'user1#1234', roles: ['Role1', 'Role2'] },
        { user: 'user2#5678', roles: ['Role3'] },
      ];
      jest.spyOn(service, 'getUsersAndRoles').mockResolvedValue(result);

      expect(await controller.getUsersAndRoles()).toBe(result);
    });
  });

  describe('getRolesByUserId', () => {
    it('should return roles for a valid user', async () => {
      const userId = '123456789';
      const roles = ['Role1', 'Role2'];
      service.getRolesByUserId.mockResolvedValue(roles);

      const result = await controller.getRolesByUserId(userId);
      expect(result).toEqual({ userId, roles });
    });

    it('should return error for invalid user', async () => {
      const userId = 'invalidUser';
      service.getRolesByUserId.mockResolvedValue(null);

      const result = await controller.getRolesByUserId(userId);
      expect(result).toEqual({ error: 'User not found or error occurred' });
    });
  });

  describe('checkActivity', () => {
    it('should return true when user has required role', async () => {
      const discordId = '123456789';
      const requiredRole = 'RequiredRole';
      service.getRolesByUserId.mockResolvedValue(['RequiredRole', 'OtherRole']);

      const result = await controller.checkActivity(discordId, requiredRole);
      expect(result).toEqual({ data: { result: true } });
    });

    it('should return false when user does not have required role', async () => {
      const discordId = '123456789';
      const requiredRole = 'RequiredRole';
      service.getRolesByUserId.mockResolvedValue(['OtherRole']);

      const result = await controller.checkActivity(discordId, requiredRole);
      expect(result).toEqual({ data: { result: false } });
    });

    it('should return error when user is not found', async () => {
      const discordId = 'invalidUser';
      const requiredRole = 'RequiredRole';
      service.getRolesByUserId.mockResolvedValue(null);

      const result = await controller.checkActivity(discordId, requiredRole);
      expect(result).toEqual({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found in the Discord server.',
        },
        data: { result: false },
      });
    });

    it('should return error when required parameters are missing', async () => {
      const result = await controller.checkActivity(undefined, undefined);
      expect(result).toEqual({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred.',
        },
        data: { result: false },
      });
    });
  });
});
