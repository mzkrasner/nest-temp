import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SecureDomainGuard } from '@/guards/auth.secure-domain';
import { ReadOnlyGuard } from '@/guards/auth.read-only';
import { ConfigService } from '@nestjs/config';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-value'),
          },
        },
        SecureDomainGuard,
        ReadOnlyGuard,
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = { name: 'Test User', email: 'test@example.com' };
      const createdUser = { id: 1, ...createUserDto };
      jest.spyOn(usersService, 'create').mockResolvedValue(createdUser);

      const result = await controller.create(createUserDto);
      expect(result).toEqual(createdUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        { id: 1, name: 'User 1', email: 'user1@example.com' },
        { id: 2, name: 'User 2', email: 'user2@example.com' },
      ];
      jest.spyOn(usersService, 'findAll').mockResolvedValue(users);

      const result = await controller.findAll();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = { id: 1, name: 'Test User', email: 'test@example.com' };
      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);

      const result = await controller.findOne('1');
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);

      await expect(controller.findOne('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      const updateUserDto = { name: 'Updated User' };
      const updatedUser = {
        id: 1,
        name: 'Updated User',
        email: 'test@example.com',
      };
      jest.spyOn(usersService, 'update').mockResolvedValue(updatedUser);

      const result = await controller.update('1', updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(usersService, 'update').mockResolvedValue(null);

      await expect(
        controller.update('999', { name: 'Updated User' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove the user', async () => {
      jest.spyOn(usersService, 'remove').mockResolvedValue(true);

      await expect(controller.remove('1')).resolves.not.toThrow();
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(usersService, 'remove').mockResolvedValue(false);

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
