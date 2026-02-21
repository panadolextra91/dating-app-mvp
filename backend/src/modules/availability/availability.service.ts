import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Availability } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAvailabilityDto): Promise<Availability> {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.checkOverlap(dto);

    return this.prisma.availability.create({
      data: {
        userId: dto.userId,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
      },
    });
  }

  async findByUserId(userId: string): Promise<Availability[]> {
    return this.prisma.availability.findMany({ where: { userId } });
  }

  private async checkOverlap(dto: CreateAvailabilityDto): Promise<void> {
    const overlap = await this.prisma.availability.findFirst({
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
