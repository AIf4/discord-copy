import { Test, TestingModule } from '@nestjs/testing';
import { ChannelController } from '@components/channel/controllers/channel.controller';
import { ChannelService } from '@components/channel/services/channel.service';
import {
  CreateChannelDto,
  UpdateChannelDto,
  CreateChannelSchema,
  UpdateChannelSchema,
} from '../dto/channel.dto';
import { JwtAuthGuard } from '@components/auth/guards/jwt-auth.guard'; // Using path alias
import { ZodValidationPipe } from '@pipes/zodValidation.pipe'; // Using path alias
import { PoliciesGuard } from '@ccasl/policies.guard';
import { PermissionsInterceptor } from '@ccasl/casl-validate.interceptor';

// Mock ChannelService
const mockChannelService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Mock Guards/Interceptors (basic mocks)
const mockJwtAuthGuard = { canActivate: jest.fn(() => true) };
const mockPoliciesGuard = { canActivate: jest.fn(() => true) };
const mockPermissionsInterceptor = {
  intercept: jest.fn((context, next) => next.handle()),
};

// Mock Pipes (basic mocks)
const mockCreateValidationPipe = { transform: jest.fn((value) => value) };
const mockUpdateValidationPipe = { transform: jest.fn((value) => value) };

describe('ChannelController', () => {
  let controller: ChannelController;
  let service: ChannelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelController],
      providers: [
        {
          provide: ChannelService,
          useValue: mockChannelService,
        },
      ],
    })
      // Override Guards, Interceptors, and Pipes for unit testing
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(PoliciesGuard)
      .useValue(mockPoliciesGuard)
      .overrideInterceptor(PermissionsInterceptor)
      .useValue(mockPermissionsInterceptor)
      // Need to override specific instances of the pipe
      .overridePipe(new ZodValidationPipe(CreateChannelSchema))
      .useValue(mockCreateValidationPipe)
      .overridePipe(new ZodValidationPipe(UpdateChannelSchema))
      .useValue(mockUpdateValidationPipe)
      .compile();

    controller = module.get<ChannelController>(ChannelController);
    service = module.get<ChannelService>(ChannelService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call channelService.create with the provided DTO', async () => {
      const createDto: CreateChannelDto = {
        name: 'Test Channel',
        description: 'A test channel',
      };
      const expectedResult = {
        id: 1,
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockChannelService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
      // Optionally check pipe transform was called if needed
      // expect(mockCreateValidationPipe.transform).toHaveBeenCalledWith(createDto, expect.anything());
    });
  });

  describe('findAll', () => {
    it('should call channelService.findAll', async () => {
      const expectedResult = [
        {
          id: 1,
          name: 'Channel 1',
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockChannelService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should call channelService.findOne with the correct id', async () => {
      const id = '1';
      const expectedResult = {
        id: 1,
        name: 'Channel 1',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockChannelService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(+id); // Ensure string id is converted to number
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should call channelService.update with the correct id and DTO', async () => {
      const id = '1';
      const updateDto: UpdateChannelDto = { name: 'Updated Channel Name' };
      const expectedResult = {
        id: 1,
        name: 'Updated Channel Name',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockChannelService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto);

      expect(service.update).toHaveBeenCalledWith(+id, updateDto); // Ensure string id is converted to number
      expect(result).toEqual(expectedResult);
      // Optionally check pipe transform was called if needed
      // expect(mockUpdateValidationPipe.transform).toHaveBeenCalledWith(updateDto, expect.anything());
    });
  });

  describe('remove', () => {
    it('should call channelService.remove with the correct id', async () => {
      const id = '1';
      const expectedResult = {
        id: 1,
        name: 'Deleted Channel',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }; // Example result
      mockChannelService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(+id); // Ensure string id is converted to number
      expect(result).toEqual(expectedResult);
    });
  });
});
