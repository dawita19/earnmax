import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from '../../src/services/user.service';
import { User } from '../../src/entities/user.entity';
import { Repository } from 'typeorm';
import { 
  mockUser, 
  mockInviter, 
  mockUserDto, 
  mockReferralNetwork 
} from '../mocks/user.mocks';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn().mockResolvedValue(mockUser),
            create: jest.fn().mockReturnValue(mockUser),
            update: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('createUser', () => {
    it('should successfully create a user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);
      
      const result = await service.createUser(mockUserDto);
      expect(result).toEqual(mockUser);
      expect(userRepository.create).toHaveBeenCalled();
    });

    it('should throw conflict exception for duplicate phone', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);
      
      await expect(service.createUser(mockUserDto)).rejects.toThrow();
    });
  });

  describe('updateVipLevel', () => {
    it('should update user VIP level', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);
      
      await service.updateVipLevel(1, 3, 6000);
      expect(userRepository.update).toHaveBeenCalled();
    });
  });

  // Additional tests for referral network updates, balance management, etc.
});