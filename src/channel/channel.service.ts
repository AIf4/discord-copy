import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateChannelDto } from './dto/channel.dto';
import { PrismaService } from 'src/prisma.service';

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

  findAll() {
    return this.prismaService.channel.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} channel`;
  }

  update(id: number, updateChannelDto: any) {
    return `This action updates a #${id} channel`;
  }

  remove(id: number) {
    return `This action removes a #${id} channel`;
  }
}
