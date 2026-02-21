import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { LikeModule } from './modules/like/like.module';
import { MatchModule } from './modules/match/match.module';
import { AvailabilityModule } from './modules/availability/availability.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    LikeModule,
    MatchModule,
    AvailabilityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
