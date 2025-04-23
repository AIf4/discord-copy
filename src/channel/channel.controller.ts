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
  BadRequestException,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto, CreateChannelSchema } from './dto/channel.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from 'src/pipes/zodValidation.pipe';
import { PermissionsInterceptor } from 'src/casl/casl-validate.interceptor';
import { PoliciesGuard } from 'src/casl/policies.guard';

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
  findOne(@Param('id') id: string) {
    return this.channelService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChannelDto: any) {
    return this.channelService.update(+id, updateChannelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.channelService.remove(+id);
  }
}
