import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

const mockPrismaService = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  it('should create a user successfully', async () => {
    const dto = {
      email: 'test@test.com',
      name: 'Test',
      age: 25,
      gender: 'MALE',
    } as any;
    const expected = {
      id: 'uuid-1',
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrismaService.user.create.mockResolvedValue(expected);

    const result = await service.create(dto);
    expect(result).toEqual(expected);
    expect(mockPrismaService.user.create).toHaveBeenCalledWith({ data: dto });
  });

  it('should throw ConflictException on duplicate email', async () => {
    const dto = {
      email: 'dup@test.com',
      name: 'Dup',
      age: 20,
      gender: 'FEMALE',
    } as any;
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint',
      {
        code: 'P2002',
        clientVersion: '6.0.0',
      },
    );

    mockPrismaService.user.create.mockRejectedValue(prismaError);

    await expect(service.create(dto)).rejects.toThrow(ConflictException);
  });

  it('should throw NotFoundException when user not found', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    await expect(service.findById('nonexistent-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return all users', async () => {
    const users = [
      { id: 'uuid-1', email: 'a@a.com', name: 'A', age: 20, gender: 'MALE' },
      { id: 'uuid-2', email: 'b@b.com', name: 'B', age: 22, gender: 'FEMALE' },
    ];

    mockPrismaService.user.findMany.mockResolvedValue(users);

    const result = await service.findAll();
    expect(result).toEqual(users);
  });

  it('should return user when found by id', async () => {
    const user = {
      id: 'uuid-1',
      email: 'a@a.com',
      name: 'A',
      age: 20,
      gender: 'MALE',
    };
    mockPrismaService.user.findUnique.mockResolvedValue(user);

    const result = await service.findById('uuid-1');
    expect(result).toEqual(user);
  });

  it('should rethrow non-P2002 errors on create', async () => {
    const dto = { email: 'x@x.com', name: 'X', age: 25, gender: 'MALE' } as any;
    mockPrismaService.user.create.mockRejectedValue(new Error('DB down'));

    await expect(service.create(dto)).rejects.toThrow('DB down');
  });
});
