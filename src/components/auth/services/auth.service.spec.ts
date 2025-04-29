import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { UserService } from '@components/users/services/users.service'; // Use path alias
import { User, Role } from '@prisma/client'; // Assuming Role enum exists

// Mock UserService
const mockUserService = {
  findOne: jest.fn(),
  createUser: jest.fn(),
};

// Mock JwtService
const mockJwtService = {
  verify: jest.fn(),
  sign: jest.fn(),
};

// Mock bcrypt (optional, but good practice for isolation)
jest.mock('bcrypt', () => ({
  compareSync: jest.fn(),
  // No need to mock genSalt/hash here as they aren't directly used in validateUser
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateToken', () => {
    it('should return user info if token is valid', async () => {
      const token = 'valid.token.string';
      const decodedPayload = {
        email: 'test@example.com',
        sub: 1,
        role: Role.DEFAULT,
      }; // Use Role enum if available
      mockJwtService.verify.mockReturnValue(decodedPayload);

      const result = await service.validateToken(token);

      expect(jwtService.verify).toHaveBeenCalledWith(token, {
        secret: process.env.JWT_SECRET,
      });
      expect(result).toEqual({
        email: decodedPayload.email,
        id: decodedPayload.sub,
      });
    });

    it('should throw BadRequestException if token is invalid', async () => {
      const token = 'invalid.token.string';
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await expect(service.validateToken(token)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.validateToken(token)).rejects.toThrow(
        'Invalid token',
      );
      expect(jwtService.verify).toHaveBeenCalledWith(token, {
        secret: process.env.JWT_SECRET,
      });
    });
  });

  describe('validateUser', () => {
    const email = 'test@example.com';
    const password = 'password123';
    const hashedPassword = 'hashedPassword';
    const user: User = {
      id: 1,
      email,
      password: hashedPassword,
      role: Role.DEFAULT, // Use Role enum
      createdAt: new Date(),
    };

    it('should return user data (without password) if credentials are valid', async () => {
      mockUserService.findOne.mockResolvedValue(user);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true); // Cast to jest.Mock

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...expectedResult } = user;
      const result = await service.validateUser(email, password);

      expect(userService.findOne).toHaveBeenCalledWith({ email });
      expect(bcrypt.compareSync).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toEqual(expectedResult);
    });

    it('should return null if user is not found', async () => {
      mockUserService.findOne.mockResolvedValue(null);

      const result = await service.validateUser(email, password);

      expect(userService.findOne).toHaveBeenCalledWith({ email });
      expect(bcrypt.compareSync).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      mockUserService.findOne.mockResolvedValue(user);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(false); // Cast to jest.Mock

      const result = await service.validateUser(email, password);

      expect(userService.findOne).toHaveBeenCalledWith({ email });
      expect(bcrypt.compareSync).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBeNull();
    });
  });

  describe('generateJwtToken', () => {
    it('should call jwtService.sign with correct payload and options', async () => {
      const userPayload = {
        email: 'test@example.com',
        id: 1,
        role: Role.DEFAULT,
      }; // Use Role enum
      const expectedToken = 'mock.jwt.token';
      const expectedSignOptions = {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRATION_TIME || '60m',
      };
      const expectedJwtPayload = {
        email: userPayload.email,
        sub: userPayload.id,
        role: userPayload.role,
      };

      mockJwtService.sign.mockReturnValue(expectedToken);

      const token = await service.generateJwtToken(userPayload);

      expect(jwtService.sign).toHaveBeenCalledWith(
        expectedJwtPayload,
        expectedSignOptions,
      );
      expect(token).toEqual(expectedToken);
    });
  });

  describe('signIn', () => {
    it('should call usersService.createUser with the provided user data', async () => {
      const userData = { email: 'new@example.com', password: 'password123' };
      const createdUser = {
        id: 2,
        email: 'new@example.com',
        role: Role.DEFAULT,
        createdAt: new Date(),
      }; // Use Role enum
      mockUserService.createUser.mockResolvedValue(createdUser);

      const result = await service.signIn(userData);

      expect(userService.createUser).toHaveBeenCalledWith(userData);
      expect(result).toEqual(createdUser);
    });
  });
});
