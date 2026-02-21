import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { LikeService } from './like.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MatchService } from '../match/match.service';
import { Prisma } from '@prisma/client';

const mockTx = {
  like: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
  },
  like: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn((fn) => fn(mockTx)),
};

const mockMatchService = {
  createMatch: jest.fn(),
};

describe('LikeService', () => {
  let service: LikeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikeService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MatchService, useValue: mockMatchService },
      ],
    }).compile();

    service = module.get<LikeService>(LikeService);
    jest.clearAllMocks();
    mockPrismaService.$transaction.mockImplementation((fn) => fn(mockTx));
  });

  it('should create a like successfully', async () => {
    const dto = { fromUserId: 'user-a', toUserId: 'user-b' };
    const like = { id: 'like-1', ...dto, createdAt: new Date() };

    mockPrismaService.user.findUnique.mockResolvedValue({ id: 'any' });
    mockTx.like.create.mockResolvedValue(like);
    mockTx.like.findUnique.mockResolvedValue(null);

    const result = await service.create(dto);
    expect(result.like).toEqual(like);
    expect(result.match).toBeUndefined();
  });

  it('should throw ConflictException on duplicate like', async () => {
    const dto = { fromUserId: 'user-a', toUserId: 'user-b' };
    const prismaError = new Prisma.PrismaClientKnownRequestError('Unique', {
      code: 'P2002',
      clientVersion: '5.0.0',
    });

    mockPrismaService.user.findUnique.mockResolvedValue({ id: 'any' });
    mockTx.like.create.mockRejectedValue(prismaError);

    await expect(service.create(dto)).rejects.toThrow(ConflictException);
  });

  it('should throw NotFoundException when user not found', async () => {
    const dto = { fromUserId: 'nonexistent', toUserId: 'user-b' };

    mockPrismaService.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'user-b' });

    await expect(service.create(dto)).rejects.toThrow(NotFoundException);
  });

  it('should create match on mutual like via MatchService', async () => {
    const dto = { fromUserId: 'user-b', toUserId: 'user-a' };
    const like = { id: 'like-2', ...dto, createdAt: new Date() };
    const mutualLike = {
      id: 'like-1',
      fromUserId: 'user-a',
      toUserId: 'user-b',
    };
    const match = {
      id: 'match-1',
      user1Id: 'user-a',
      user2Id: 'user-b',
      createdAt: new Date(),
    };

    mockPrismaService.user.findUnique.mockResolvedValue({ id: 'any' });
    mockTx.like.create.mockResolvedValue(like);
    mockTx.like.findUnique.mockResolvedValue(mutualLike);
    mockMatchService.createMatch.mockResolvedValue(match);

    const result = await service.create(dto);
    expect(result.like).toEqual(like);
    expect(result.match).toEqual(match);
    expect(mockMatchService.createMatch).toHaveBeenCalledWith(
      mockTx,
      dto.fromUserId,
      dto.toUserId,
    );
  });

  it('should return likes by fromUserId', async () => {
    const likes = [{ id: 'like-1', fromUserId: 'user-a', toUserId: 'user-b' }];
    mockPrismaService.like.findMany.mockResolvedValue(likes);

    const result = await service.findByFromUserId('user-a');
    expect(result).toEqual(likes);
    expect(mockPrismaService.like.findMany).toHaveBeenCalledWith({
      where: { fromUserId: 'user-a' },
      include: { toUser: true },
    });
  });

  it('should rethrow non-P2002 errors on createLike', async () => {
    const dto = { fromUserId: 'user-a', toUserId: 'user-b' };

    mockPrismaService.user.findUnique.mockResolvedValue({ id: 'any' });
    mockTx.like.create.mockRejectedValue(new Error('DB down'));

    await expect(service.create(dto)).rejects.toThrow('DB down');
  });
});
