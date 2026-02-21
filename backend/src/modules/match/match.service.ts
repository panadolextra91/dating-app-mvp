import { Injectable } from '@nestjs/common';
import { Match, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MatchService {
  constructor(private readonly prisma: PrismaService) {}

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
        return tx.match.findFirst({ where: { user1Id, user2Id } });
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
}
