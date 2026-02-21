import { Controller, Get, Param } from '@nestjs/common';
import { MatchService } from './match.service';

@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get(':userId')
  findByUserId(@Param('userId') userId: string) {
    return this.matchService.findByUserId(userId);
  }
}
