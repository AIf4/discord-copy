import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let usersService: UsersService;
  let service: AuthService;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: bcrypt.hashSync('password123', 10),
    nickname: 'testUser',
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mockJwtToken'),
    verify: jest.fn(),
  };

  const mockUsersService = {
    findOne: jest.fn().mockResolvedValue(mockUser),
    createUser: jest.fn().mockResolvedValue(mockUser),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const result = await service.validateUser(mockUser.email, 'password123');
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        nickname: mockUser.nickname,
      });
    });

    it('should return null if credentials are invalid', async () => {
      const result = await service.validateUser(
        mockUser.email,
        'wrongPassword',
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return JWT token if credentials are valid', async () => {
      const result = await service.login({
        email: mockUser.email,
        password: 'password123',
      });
      expect(result).toEqual('mockJwtToken');
    });

    it('should throw error if credentials are invalid', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValueOnce(null);
      await expect(
        service.login({ email: mockUser.email, password: 'wrongPassword' }),
      ).rejects.toThrowError('Invalid credentials');
    });
  });

  describe('validateToken', () => {
    it('should return user data if token is valid', async () => {
      const payload = { nick: mockUser.nickname, sub: mockUser.id };
      jwtService.verify = jest.fn().mockReturnValue(payload);

      const result = await service.validateToken('mockToken');
      expect(result).toEqual({ nickname: payload.nick, id: payload.sub });
    });

    it('should throw BadRequestException if token is invalid', async () => {
      jwtService.verify = jest.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.validateToken('invalidToken')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('signIn', () => {
    it('should create a user', async () => {
      const result = await service.signIn(mockUser);
      expect(result).toEqual(mockUser);
    });
  });
});
