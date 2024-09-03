import { Test, TestingModule } from '@nestjs/testing';
import { DiscordController } from './discord.controller';
import { DiscordService } from './discord.service';

describe('DiscordController', () => {
  let controller: DiscordController;
  let service: DiscordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscordController],
      providers: [
        {
          provide: DiscordService,
          useValue: {
            getUsersAndRoles: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DiscordController>(DiscordController);
    service = module.get<DiscordService>(DiscordService);
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
});
