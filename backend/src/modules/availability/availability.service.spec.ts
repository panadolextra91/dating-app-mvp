import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
  },
  availability: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
  },
};

describe('AvailabilityService', () => {
  let service: AvailabilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);
    jest.clearAllMocks();
  });

  it('should create availability successfully', async () => {
    const dto = {
      userId: 'user-1',
      startTime: '2026-03-01T09:00:00Z',
      endTime: '2026-03-01T10:00:00Z',
    };
    const expected = {
      id: 'avail-1',
      userId: dto.userId,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
    };

    mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1' });
    mockPrismaService.availability.findFirst.mockResolvedValue(null);
    mockPrismaService.availability.create.mockResolvedValue(expected);

    const result = await service.create(dto);
    expect(result).toEqual(expected);
  });

  it('should throw NotFoundException when user not found', async () => {
    const dto = {
      userId: 'nonexistent',
      startTime: '2026-03-01T09:00:00Z',
      endTime: '2026-03-01T10:00:00Z',
    };

    mockPrismaService.user.findUnique.mockResolvedValue(null);

    await expect(service.create(dto)).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException on overlapping time slot', async () => {
    const dto = {
      userId: 'user-1',
      startTime: '2026-03-01T09:30:00Z',
      endTime: '2026-03-01T10:30:00Z',
    };
    const existingSlot = {
      id: 'avail-existing',
      userId: 'user-1',
      startTime: new Date('2026-03-01T09:00:00Z'),
      endTime: new Date('2026-03-01T10:00:00Z'),
    };

    mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1' });
    mockPrismaService.availability.findFirst.mockResolvedValue(existingSlot);

    await expect(service.create(dto)).rejects.toThrow(ConflictException);
  });
});
