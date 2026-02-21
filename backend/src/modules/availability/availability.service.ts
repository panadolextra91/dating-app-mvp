import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Availability, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAvailabilityDto): Promise<Availability> {
    return this.prisma.$transaction(
      async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: dto.userId },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }

        await this.checkOverlap(tx, dto);

        return tx.availability.create({
          data: {
            userId: dto.userId,
            startTime: new Date(dto.startTime),
            endTime: new Date(dto.endTime),
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async findByUserId(userId: string): Promise<Availability[]> {
    return this.prisma.availability.findMany({ where: { userId } });
  }

  private async checkOverlap(
    tx: Prisma.TransactionClient,
    dto: CreateAvailabilityDto,
  ): Promise<void> {
    const overlap = await tx.availability.findFirst({
      where: {
        userId: dto.userId,
        startTime: { lt: new Date(dto.endTime) },
        endTime: { gt: new Date(dto.startTime) },
      },
    });

    if (overlap) {
      throw new ConflictException(
        'Time slot overlaps with existing availability',
      );
    }
  }
}
