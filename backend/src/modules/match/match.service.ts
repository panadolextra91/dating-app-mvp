import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Match, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { findFirstCommonSlot } from '../../common/utils/interval.util';

@Injectable()
export class MatchService {
  constructor(private readonly prisma: PrismaService) { }

  async createMatch(
    tx: Prisma.TransactionClient,
    userIdA: string,
    userIdB: string,
  ): Promise<Match> {
    const [user1Id, user2Id] =
      userIdA < userIdB ? [userIdA, userIdB] : [userIdB, userIdA];

    try {
      return await tx.match.create({ data: { user1Id, user2Id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const existing = await tx.match.findFirst({
          where: { user1Id, user2Id },
        });
        if (!existing) {
          throw new InternalServerErrorException(
            'Match vanished during creation',
          );
        }
        return existing;
      }
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Match[]> {
    return this.prisma.match.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: { user1: true, user2: true },
    });
  }

  async findCommonSlot(
    matchId: string,
  ): Promise<{ startTime: Date; endTime: Date } | null> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    const now = new Date();

    const [slotsA, slotsB] = await Promise.all([
      this.prisma.availability.findMany({
        where: { userId: match.user1Id, endTime: { gt: now } },
        orderBy: { startTime: 'asc' },
      }),
      this.prisma.availability.findMany({
        where: { userId: match.user2Id, endTime: { gt: now } },
        orderBy: { startTime: 'asc' },
      }),
    ]);

    return findFirstCommonSlot(slotsA, slotsB);
  }
}
