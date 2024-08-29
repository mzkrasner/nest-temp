import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = { name: 'Test User', email: 'test@example.com' };
      const savedUser = { id: 1, ...userData };
      jest.spyOn(repository, 'create').mockReturnValue(savedUser);
      jest.spyOn(repository, 'save').mockResolvedValue(savedUser);

      const result = await service.create(userData);
      expect(result).toEqual(savedUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        { id: 1, name: 'User 1', email: 'user1@example.com' },
        { id: 2, name: 'User 2', email: 'user2@example.com' },
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = { id: 1, name: 'Test User', email: 'test@example.com' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(user);

      const result = await service.findOne(1);
      expect(result).toEqual(user);
    });

    it('should return null if user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.findOne(999);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      const user = { id: 1, name: 'Test User', email: 'test@example.com' };
      const updatedUser = { ...user, name: 'Updated User' };
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
      jest.spyOn(repository, 'findOne').mockResolvedValue(updatedUser);

      const result = await service.update(1, { name: 'Updated User' });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should remove the user and return true', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1, raw: [] });

      const result = await service.remove(1);
      expect(result).toBe(true);
    });

    it('should return false if user not found', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0, raw: [] });

      const result = await service.remove(999);
      expect(result).toBe(false);
    });
  });
});
