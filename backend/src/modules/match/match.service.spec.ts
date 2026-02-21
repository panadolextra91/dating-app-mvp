import { Test, TestingModule } from '@nestjs/testing';
import { MatchService } from './match.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

const mockTx = {
  match: {
    create: jest.fn(),
    findFirst: jest.fn(),
  },
};

const mockPrismaService = {
  match: {
    findMany: jest.fn(),
  },
};

describe('MatchService', () => {
  let service: MatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<MatchService>(MatchService);
    jest.clearAllMocks();
  });

  describe('createMatch', () => {
    it('should sort user IDs so user1Id < user2Id before creating', async () => {
      const match = {
        id: 'match-1',
        user1Id: 'aaa',
        user2Id: 'zzz',
        createdAt: new Date(),
      };

      mockTx.match.create.mockResolvedValue(match);

      const result = await service.createMatch(mockTx as any, 'zzz', 'aaa');

      expect(mockTx.match.create).toHaveBeenCalledWith({
        data: { user1Id: 'aaa', user2Id: 'zzz' },
      });
      expect(result).toEqual(match);
    });

    it('should return existing match on P2002 (idempotent)', async () => {
      const existingMatch = {
        id: 'match-1',
        user1Id: 'aaa',
        user2Id: 'zzz',
        createdAt: new Date(),
      };
      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique', {
        code: 'P2002',
        clientVersion: '5.0.0',
      });

      mockTx.match.create.mockRejectedValue(prismaError);
      mockTx.match.findFirst.mockResolvedValue(existingMatch);

      const result = await service.createMatch(mockTx as any, 'aaa', 'zzz');

      expect(mockTx.match.findFirst).toHaveBeenCalledWith({
        where: { user1Id: 'aaa', user2Id: 'zzz' },
      });
      expect(result).toEqual(existingMatch);
    });

    it('should rethrow non-P2002 errors', async () => {
      mockTx.match.create.mockRejectedValue(new Error('DB down'));

      await expect(
        service.createMatch(mockTx as any, 'aaa', 'zzz'),
      ).rejects.toThrow('DB down');
    });
  });

  describe('findByUserId', () => {
    it('should query matches where user is user1 or user2', async () => {
      const matches = [
        { id: 'm1', user1Id: 'user-a', user2Id: 'user-b' },
        { id: 'm2', user1Id: 'user-c', user2Id: 'user-a' },
      ];

      mockPrismaService.match.findMany.mockResolvedValue(matches);

      const result = await service.findByUserId('user-a');

      expect(mockPrismaService.match.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ user1Id: 'user-a' }, { user2Id: 'user-a' }],
        },
        include: { user1: true, user2: true },
      });
      expect(result).toEqual(matches);
    });
  });
});
