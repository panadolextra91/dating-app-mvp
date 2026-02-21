import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockTx = {
  user: {
    findUnique: jest.fn(),
  },
  availability: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
};

const mockPrismaService = {
  availability: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn((fn) => fn(mockTx)),
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
    mockPrismaService.$transaction.mockImplementation((fn) => fn(mockTx));
  });

  it('should create availability successfully', async () => {
    const dto = {
      userId: 'user-1',
      startTime: '2026-03-01T09:00:00Z',
      endTime: '2026-03-01T10:00:00Z',
    };
    const expected = { id: 'avail-1', ...dto };

    mockTx.user.findUnique.mockResolvedValue({ id: 'user-1' });
    mockTx.availability.findFirst.mockResolvedValue(null);
    mockTx.availability.create.mockResolvedValue(expected);

    const result = await service.create(dto);
    expect(result).toEqual(expected);
  });

  it('should throw NotFoundException when user not found', async () => {
    const dto = {
      userId: 'nonexistent',
      startTime: '2026-03-01T09:00:00Z',
      endTime: '2026-03-01T10:00:00Z',
    };

    mockTx.user.findUnique.mockResolvedValue(null);

    await expect(service.create(dto)).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException on overlapping time slot', async () => {
    const dto = {
      userId: 'user-1',
      startTime: '2026-03-01T09:30:00Z',
      endTime: '2026-03-01T10:30:00Z',
    };

    mockTx.user.findUnique.mockResolvedValue({ id: 'user-1' });
    mockTx.availability.findFirst.mockResolvedValue({ id: 'existing' });

    await expect(service.create(dto)).rejects.toThrow(ConflictException);
  });

  it('should return availabilities by userId', async () => {
    const avails = [{ id: 'avail-1', userId: 'user-1' }];
    mockPrismaService.availability.findMany.mockResolvedValue(avails);

    const result = await service.findByUserId('user-1');
    expect(result).toEqual(avails);
  });
});
