import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../../src/controllers/user.controller';
import { UserService } from '../../../src/services/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../../src/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'mock-jwt-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') return 'test-secret';
              if (key === 'JWT_EXPIRES_IN') return '1h';
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto = {
        fullName: 'Test User',
        phoneNumber: '+251911223344',
        email: 'test@earnmax.com',
        password: 'Password123!',
        inviterCode: 'INV123',
      };

      jest.spyOn(userService, 'register').mockResolvedValue({
        user: {
          userId: 1,
          fullName: 'Test User',
          phoneNumber: '+251911223344',
          email: 'test@earnmax.com',
          vipLevel: 0,
        },
        token: 'mock-jwt-token',
      });

      const result = await controller.register(registerDto);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.vipLevel).toBe(0);
    });

    it('should prevent duplicate phone registration', async () => {
      const registerDto = {
        fullName: 'Test User',
        phoneNumber: '+251911223344',
        email: 'test@earnmax.com',
        password: 'Password123!',
        inviterCode: 'INV123',
      };

      jest.spyOn(userService, 'register').mockRejectedValue(
        new Error('Phone number already registered')
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        'Phone number already registered'
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        userId: 1,
        fullName: 'Test User',
        phoneNumber: '+251911223344',
        email: 'test@earnmax.com',
        vipLevel: 1,
        balance: 1000,
      };

      jest.spyOn(userService, 'getProfile').mockResolvedValue(mockUser);

      const result = await controller.getProfile({ user: { userId: 1 } });
      expect(result).toEqual(mockUser);
    });
  });
});