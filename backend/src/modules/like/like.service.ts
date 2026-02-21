import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Like, Match, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MatchService } from '../match/match.service';
import { CreateLikeDto } from './dto/create-like.dto';

@Injectable()
export class LikeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matchService: MatchService,
  ) {}

  async create(dto: CreateLikeDto): Promise<{ like: Like; match?: Match }> {
    return this.prisma.$transaction(async (tx) => {
      await this.verifyUsersExist(tx, dto.fromUserId, dto.toUserId);

      const like = await this.createLike(tx, dto);
      const match = await this.checkAndCreateMatch(tx, dto);

      return { like, match: match ?? undefined };
    });
  }

  async findByFromUserId(userId: string): Promise<Like[]> {
    return this.prisma.like.findMany({
      where: { fromUserId: userId },
      include: { toUser: true },
    });
  }

  private async verifyUsersExist(
    tx: Prisma.TransactionClient,
    fromUserId: string,
    toUserId: string,
  ): Promise<void> {
    const [fromUser, toUser] = await Promise.all([
      tx.user.findUnique({ where: { id: fromUserId } }),
      tx.user.findUnique({ where: { id: toUserId } }),
    ]);

    if (!fromUser) throw new NotFoundException('From user not found');
    if (!toUser) throw new NotFoundException('To user not found');
  }

  private async createLike(
    tx: Prisma.TransactionClient,
    dto: CreateLikeDto,
  ): Promise<Like> {
    try {
      return await tx.like.create({
        data: { fromUserId: dto.fromUserId, toUserId: dto.toUserId },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Like already exists');
      }
      throw error;
    }
  }

  private async checkAndCreateMatch(
    tx: Prisma.TransactionClient,
    dto: CreateLikeDto,
  ): Promise<Match | null> {
    const mutualLike = await tx.like.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId: dto.toUserId,
          toUserId: dto.fromUserId,
        },
      },
    });

    if (!mutualLike) return null;

    return this.matchService.createMatch(tx, dto.fromUserId, dto.toUserId);
  }
}
