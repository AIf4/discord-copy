import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../../../components/auth/services/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { ZodValidationPipe } from '../../../pipes/zodValidation.pipe';

import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';
import { CreateUserDto } from '@components/users/dto/user.dto';
import { createUserSchema } from '@components/users/dto/user.dto';

// Mock AuthService
const mockAuthService = {
  generateJwtToken: jest.fn(),
  signIn: jest.fn(),
  validateToken: jest.fn(),
};

// Mock Response object
const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {
    cookie: jest.fn().mockReturnThis(), // Chainable
    status: jest.fn().mockReturnThis(), // Chainable
    json: jest.fn().mockReturnThis(), // Chainable
    clearCookie: jest.fn().mockReturnThis(), // Chainable
  };
  return res;
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let response: Response;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      // Override guards and pipes for unit testing
      .overrideGuard(LocalAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) }) // Mock guard to always allow access
      .overridePipe(new ZodValidationPipe(createUserSchema)) // Mock pipe if needed, or test separately
      .useValue({ transform: jest.fn((value) => value) }) // Mock pipe to just pass value through
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    response = mockResponse() as Response; // Cast the partial mock to Response type

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should generate a JWT, set a cookie, and return success message', async () => {
      const user = { userId: 1, username: 'test' };
      const token = 'mockAccessToken';
      const req = { user }; // Mock request object with user property added by LocalAuthGuard

      mockAuthService.generateJwtToken.mockResolvedValue(token);

      await controller.login(req, response);

      expect(authService.generateJwtToken).toHaveBeenCalledWith(user);
      expect(response.cookie).toHaveBeenCalledWith('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(response.json).toHaveBeenCalledWith({
        message: 'Login successfully',
      });
    });
  });

  describe('signupUser', () => {
    it('should call authService.signIn with user data and return the result', async () => {
      const userData: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        // Add other required fields from CreateUserDto if any
      };
      const signupResult = { id: 1, email: userData.email };

      mockAuthService.signIn.mockResolvedValue(signupResult);

      const result = await controller.signupUser(userData);

      expect(authService.signIn).toHaveBeenCalledWith(userData);
      expect(result).toEqual(signupResult);
    });
  });

  describe('logout', () => {
    it('should clear the token cookie and return success message', async () => {
      await controller.logout(response);

      expect(response.clearCookie).toHaveBeenCalledWith('token');
      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(response.json).toHaveBeenCalledWith({
        message: 'Logout successfully',
      });
    });
  });

  // Example for the commented out verify-token endpoint
  /*
  describe('verifyToken', () => {
    it('should call authService.validateToken with the token', async () => {
      const token = 'some-jwt-token';
      const req = { body: { token } };
      const validationResult = { valid: true, user: { id: 1 } };

      mockAuthService.validateToken.mockResolvedValue(validationResult);

      const result = await controller.verifyToken(req);

      expect(authService.validateToken).toHaveBeenCalledWith(token);
      expect(result).toEqual(validationResult);
    });
  });
  */
});
