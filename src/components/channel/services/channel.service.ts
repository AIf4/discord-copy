import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma.service';
import { CreateChannelDto } from '../dto/channel.dto';

@Injectable()
export class ChannelService {
  constructor(private prismaService: PrismaService) {}

  async create(createChannelDto: CreateChannelDto) {
    try {
      // Check if the channel name already exists
      const existingChannel = await this.prismaService.channel.findUnique({
        where: { name: createChannelDto.name },
      });
      if (existingChannel) {
        throw new BadRequestException({
          message: 'The channel name already exists',
          field: 'name',
        });
      }
      // Create the channel if it doesn't exist
      return await this.prismaService.channel.create({
        data: createChannelDto,
      });
    } catch (error) {
      return error;
    }
  }

  async findAll() {
    return await this.prismaService.channel.findMany();
  }

  async findOne(id: number) {
    return await this.prismaService.channel.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateChannelDto: any) {
    return await this.prismaService.channel.update({
      where: { id },
      data: updateChannelDto,
    });
  }

  async remove(id: number) {
    return await this.prismaService.channel.delete({
      where: { id },
    });
  }
}
