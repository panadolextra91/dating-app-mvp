import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { MatchService } from './match.service';

@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get('user/:userId')
  findByUserId(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.matchService.findByUserId(userId);
  }

  @Get(':matchId/common-slot')
  findCommonSlot(@Param('matchId', ParseUUIDPipe) matchId: string) {
    return this.matchService.findCommonSlot(matchId);
  }
}
