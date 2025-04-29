import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { PrismaService } from '../../../prisma.service'; // Adjust path if needed
import { CreateChannelDto, UpdateChannelDto } from '../dto/channel.dto';
import { Channel } from '@prisma/client';

// Mock PrismaService
const mockPrismaService = {
  channel: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ChannelService', () => {
  let service: ChannelService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ChannelService>(ChannelService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateChannelDto = {
      name: 'New Channel',
      description: 'Desc',
    };
    const expectedChannel: Channel = {
      id: 1,
      name: 'New Channel',
      description: 'Desc',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a channel successfully if name does not exist', async () => {
      mockPrismaService.channel.findUnique.mockResolvedValue(null);
      mockPrismaService.channel.create.mockResolvedValue(expectedChannel);

      const result = await service.create(createDto);

      expect(prisma.channel.findUnique).toHaveBeenCalledWith({
        where: { name: createDto.name },
      });
      expect(prisma.channel.create).toHaveBeenCalledWith({ data: createDto });
      expect(result).toEqual(expectedChannel);
    });

    it('should throw BadRequestException if channel name already exists', async () => {
      mockPrismaService.channel.findUnique.mockResolvedValue(expectedChannel); // Simulate channel exists

      /* await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      ); */
      await expect(service.create(createDto)).rejects.toThrow(
        JSON.stringify({
          // Match the exact error structure
          message: 'The channel name already exists',
          field: 'name',
        }),
      );

      expect(prisma.channel.findUnique).toHaveBeenCalledWith({
        where: { name: createDto.name },
      });
      expect(prisma.channel.create).not.toHaveBeenCalled();
    });

    // Note: The original implementation's catch block returns the error object directly,
    // which is generally not recommended. This test reflects that behavior.
    // Ideally, the catch block should re-throw a standard NestJS exception.
    it('should return the error if prisma.create fails (based on current implementation)', async () => {
      const prismaError = new Error('Prisma create failed');
      mockPrismaService.channel.findUnique.mockResolvedValue(null);
      mockPrismaService.channel.create.mockRejectedValue(prismaError);

      const result = await service.create(createDto);

      expect(prisma.channel.findUnique).toHaveBeenCalledWith({
        where: { name: createDto.name },
      });
      expect(prisma.channel.create).toHaveBeenCalledWith({ data: createDto });
      expect(result).toBeInstanceOf(Error); // Check if it returns the error object
      expect(result).toEqual(prismaError);
    });
  });

  describe('findAll', () => {
    it('should return an array of channels', async () => {
      const expectedResult: Channel[] = [
        {
          id: 1,
          name: 'Channel 1',
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Channel 2',
          description: 'Test',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockPrismaService.channel.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll();

      expect(prisma.channel.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    const channelId = 1;
    const expectedChannel: Channel = {
      id: channelId,
      name: 'Found Channel',
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return a channel if found', async () => {
      mockPrismaService.channel.findUnique.mockResolvedValue(expectedChannel);

      const result = await service.findOne(channelId);

      expect(prisma.channel.findUnique).toHaveBeenCalledWith({
        where: { id: channelId },
      });
      expect(result).toEqual(expectedChannel);
    });

    it('should return null if channel is not found', async () => {
      mockPrismaService.channel.findUnique.mockResolvedValue(null);

      const result = await service.findOne(channelId);

      expect(prisma.channel.findUnique).toHaveBeenCalledWith({
        where: { id: channelId },
      });
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const channelId = 1;
    const updateDto: UpdateChannelDto = { name: 'Updated Name' };
    const expectedUpdatedChannel: Channel = {
      id: channelId,
      name: 'Updated Name',
      description: 'Original Desc',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update and return the channel', async () => {
      mockPrismaService.channel.update.mockResolvedValue(
        expectedUpdatedChannel,
      );

      const result = await service.update(channelId, updateDto);

      expect(prisma.channel.update).toHaveBeenCalledWith({
        where: { id: channelId },
        data: updateDto,
      });
      expect(result).toEqual(expectedUpdatedChannel);
    });

    // Add test for case where update fails (e.g., channel not found by Prisma) if needed
    it('should throw error if prisma update fails', async () => {
      const prismaError = new Error('Update failed');
      mockPrismaService.channel.update.mockRejectedValue(prismaError);

      await expect(service.update(channelId, updateDto)).rejects.toThrow(
        prismaError,
      );

      expect(prisma.channel.update).toHaveBeenCalledWith({
        where: { id: channelId },
        data: updateDto,
      });
    });
  });

  describe('remove', () => {
    const channelId = 1;
    const expectedDeletedChannel: Channel = {
      id: channelId,
      name: 'Deleted Channel',
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should delete and return the channel', async () => {
      mockPrismaService.channel.delete.mockResolvedValue(
        expectedDeletedChannel,
      );

      const result = await service.remove(channelId);

      expect(prisma.channel.delete).toHaveBeenCalledWith({
        where: { id: channelId },
      });
      expect(result).toEqual(expectedDeletedChannel);
    });

    // Add test for case where delete fails (e.g., channel not found by Prisma) if needed
    it('should throw error if prisma delete fails', async () => {
      const prismaError = new Error('Delete failed');
      mockPrismaService.channel.delete.mockRejectedValue(prismaError);

      await expect(service.remove(channelId)).rejects.toThrow(prismaError);

      expect(prisma.channel.delete).toHaveBeenCalledWith({
        where: { id: channelId },
      });
    });
  });
});
