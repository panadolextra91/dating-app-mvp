import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { CreateLikeDto } from './dto/create-like.dto';

@Controller('likes')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post()
  create(@Body() dto: CreateLikeDto) {
    return this.likeService.create(dto);
  }

  @Get('from/:userId')
  findByFromUserId(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.likeService.findByFromUserId(userId);
  }
}
