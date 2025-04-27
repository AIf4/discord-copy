import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  UseInterceptors,
} from '@nestjs/common';

import {
  CreateChannelDto,
  CreateChannelSchema,
  UpdateChannelDto,
  UpdateChannelSchema,
} from '../dto/channel.dto';
import { ChannelService } from '../services/channel.service';

import { PermissionsInterceptor, PoliciesGuard } from 'src/casl';
import { ZodValidationPipe } from 'src/pipes/zodValidation.pipe';
import { JwtAuthGuard } from 'src/components/auth/guards/jwt-auth.guard';

@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @UseInterceptors(PermissionsInterceptor)
  @UsePipes(new ZodValidationPipe(CreateChannelSchema))
  create(@Body() createChannelDto: CreateChannelDto) {
    return this.channelService.create(createChannelDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @UseInterceptors(PermissionsInterceptor)
  findAll() {
    return this.channelService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @UseInterceptors(PermissionsInterceptor)
  findOne(@Param('id') id: string) {
    return this.channelService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @UseInterceptors(PermissionsInterceptor)
  @UsePipes(new ZodValidationPipe(UpdateChannelSchema))
  update(@Param('id') id: string, @Body() updateChannelDto: UpdateChannelDto) {
    return this.channelService.update(+id, updateChannelDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @UseInterceptors(PermissionsInterceptor)
  remove(@Param('id') id: string) {
    return this.channelService.remove(+id);
  }
}
