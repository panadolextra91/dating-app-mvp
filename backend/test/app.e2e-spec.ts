import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { resetDatabase } from './prisma-cleanup';

/** Helper: generate an ISO string N days from now at a specific hour (UTC). */
function futureDate(daysFromNow: number, hour: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
}

describe('Dating App MVP (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let userAId: string;
  let userBId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prisma = app.get(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await resetDatabase(prisma);
    await app.close();
  });

  // ─── Users ──────────────────────────────────────────────────────────

  describe('Users', () => {
    it('POST /users - should create User A', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'alice@test.com',
          name: 'Alice',
          age: 25,
          gender: 'FEMALE',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe('alice@test.com');
      userAId = res.body.id;
    });

    it('POST /users - should create User B', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'bob@test.com',
          name: 'Bob',
          age: 28,
          gender: 'MALE',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      userBId = res.body.id;
    });

    it('POST /users - should reject duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'alice@test.com',
          name: 'Alice',
          age: 25,
          gender: 'FEMALE',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'alice@test.com',
          name: 'Alice Again',
          age: 30,
          gender: 'FEMALE',
        })
        .expect(409);
    });

    it('POST /users - should reject age < 18', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'kid@test.com',
          name: 'Kid',
          age: 16,
          gender: 'MALE',
        })
        .expect(400);
    });
    it('POST /users - should reject age > 120', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'old@test.com',
          name: 'Ancient',
          age: 999,
          gender: 'MALE',
        })
        .expect(400);
    });
  });

  // ─── Likes & Matching ──────────────────────────────────────────────

  describe('Likes & Matching', () => {
    beforeEach(async () => {
      const resA = await request(app.getHttpServer()).post('/users').send({
        email: 'alice@test.com',
        name: 'Alice',
        age: 25,
        gender: 'FEMALE',
      });
      userAId = resA.body.id;

      const resB = await request(app.getHttpServer())
        .post('/users')
        .send({ email: 'bob@test.com', name: 'Bob', age: 28, gender: 'MALE' });
      userBId = resB.body.id;
    });

    it('POST /likes - A likes B, no match yet', async () => {
      const res = await request(app.getHttpServer())
        .post('/likes')
        .send({ fromUserId: userAId, toUserId: userBId })
        .expect(201);

      expect(res.body.like).toHaveProperty('id');
      expect(res.body.like.fromUserId).toBe(userAId);
      expect(res.body.like.toUserId).toBe(userBId);
      expect(res.body.match).toBeUndefined();
    });

    it('POST /likes - B likes A, match created', async () => {
      await request(app.getHttpServer())
        .post('/likes')
        .send({ fromUserId: userAId, toUserId: userBId });

      const res = await request(app.getHttpServer())
        .post('/likes')
        .send({ fromUserId: userBId, toUserId: userAId })
        .expect(201);

      expect(res.body.like).toHaveProperty('id');
      expect(res.body.match).toHaveProperty('id');
      expect(res.body.match.user1Id).toBeDefined();
      expect(res.body.match.user2Id).toBeDefined();
    });

    it('POST /likes - duplicate like returns 409', async () => {
      await request(app.getHttpServer())
        .post('/likes')
        .send({ fromUserId: userAId, toUserId: userBId });

      await request(app.getHttpServer())
        .post('/likes')
        .send({ fromUserId: userAId, toUserId: userBId })
        .expect(409);
    });

    it('POST /likes - self-like returns 400', async () => {
      await request(app.getHttpServer())
        .post('/likes')
        .send({ fromUserId: userAId, toUserId: userAId })
        .expect(400);
    });

    it('GET /matches/:userId - returns matches after mutual like', async () => {
      await request(app.getHttpServer())
        .post('/likes')
        .send({ fromUserId: userAId, toUserId: userBId });
      await request(app.getHttpServer())
        .post('/likes')
        .send({ fromUserId: userBId, toUserId: userAId });

      const res = await request(app.getHttpServer())
        .get(`/matches/user/${userAId}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty('user1');
      expect(res.body[0]).toHaveProperty('user2');
    });
  });

  // ─── Availability ──────────────────────────────────────────────────

  describe('Availability', () => {
    beforeEach(async () => {
      const resA = await request(app.getHttpServer()).post('/users').send({
        email: 'alice@test.com',
        name: 'Alice',
        age: 25,
        gender: 'FEMALE',
      });
      userAId = resA.body.id;

      const resB = await request(app.getHttpServer())
        .post('/users')
        .send({ email: 'bob@test.com', name: 'Bob', age: 28, gender: 'MALE' });
      userBId = resB.body.id;
    });

    it('POST /availabilities - create slot for User A', async () => {
      const res = await request(app.getHttpServer())
        .post('/availabilities')
        .send({
          userId: userAId,
          startTime: futureDate(2, 9),
          endTime: futureDate(2, 10),
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.userId).toBe(userAId);
    });

    it('POST /availabilities - overlapping slot for different user succeeds', async () => {
      await request(app.getHttpServer()).post('/availabilities').send({
        userId: userAId,
        startTime: futureDate(2, 9),
        endTime: futureDate(2, 10),
      });

      await request(app.getHttpServer())
        .post('/availabilities')
        .send({
          userId: userBId,
          startTime: futureDate(2, 9),
          endTime: futureDate(2, 11),
        })
        .expect(201);
    });

    it('POST /availabilities - overlapping slot for SAME user returns 409', async () => {
      await request(app.getHttpServer()).post('/availabilities').send({
        userId: userAId,
        startTime: futureDate(2, 9),
        endTime: futureDate(2, 10),
      });

      await request(app.getHttpServer())
        .post('/availabilities')
        .send({
          userId: userAId,
          startTime: futureDate(2, 9),
          endTime: futureDate(2, 11),
        })
        .expect(409);
    });

    it('POST /availabilities - endTime before startTime returns 400', async () => {
      await request(app.getHttpServer())
        .post('/availabilities')
        .send({
          userId: userAId,
          startTime: futureDate(2, 10),
          endTime: futureDate(2, 9),
        })
        .expect(400);
    });

    it('GET /availabilities/:userId - returns user slots', async () => {
      await request(app.getHttpServer()).post('/availabilities').send({
        userId: userAId,
        startTime: futureDate(2, 9),
        endTime: futureDate(2, 10),
      });

      const res = await request(app.getHttpServer())
        .get(`/availabilities/${userAId}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
    });
  });

  // ─── Common Slot ───────────────────────────────────────────────────

  describe('Common Slot', () => {
    let matchId: string;

    beforeEach(async () => {
      const resA = await request(app.getHttpServer()).post('/users').send({
        email: 'alice@test.com',
        name: 'Alice',
        age: 25,
        gender: 'FEMALE',
      });
      userAId = resA.body.id;

      const resB = await request(app.getHttpServer())
        .post('/users')
        .send({ email: 'bob@test.com', name: 'Bob', age: 28, gender: 'MALE' });
      userBId = resB.body.id;

      // Create mutual like → match
      await request(app.getHttpServer())
        .post('/likes')
        .send({ fromUserId: userAId, toUserId: userBId });
      const matchRes = await request(app.getHttpServer())
        .post('/likes')
        .send({ fromUserId: userBId, toUserId: userAId });
      matchId = matchRes.body.match.id;
    });

    it('GET /matches/:matchId/common-slot - returns common slot when overlap exists', async () => {
      // A free: day+3 from 9 to 12
      await request(app.getHttpServer()).post('/availabilities').send({
        userId: userAId,
        startTime: futureDate(3, 9),
        endTime: futureDate(3, 12),
      });

      // B free: day+3 from 11 to 14
      await request(app.getHttpServer()).post('/availabilities').send({
        userId: userBId,
        startTime: futureDate(3, 11),
        endTime: futureDate(3, 14),
      });

      const res = await request(app.getHttpServer())
        .get(`/matches/${matchId}/common-slot`)
        .expect(200);

      expect(res.body.matchId).toBe(matchId);
      expect(res.body.commonSlot).not.toBeNull();
      expect(res.body.commonSlot.start).toBeDefined();
      expect(res.body.commonSlot.end).toBeDefined();
    });

    it('GET /matches/:matchId/common-slot - returns null when no overlap', async () => {
      // A free: day+3 from 9 to 10
      await request(app.getHttpServer()).post('/availabilities').send({
        userId: userAId,
        startTime: futureDate(3, 9),
        endTime: futureDate(3, 10),
      });

      // B free: day+3 from 14 to 16
      await request(app.getHttpServer()).post('/availabilities').send({
        userId: userBId,
        startTime: futureDate(3, 14),
        endTime: futureDate(3, 16),
      });

      const res = await request(app.getHttpServer())
        .get(`/matches/${matchId}/common-slot`)
        .expect(200);

      expect(res.body.matchId).toBe(matchId);
      expect(res.body.commonSlot).toBeNull();
    });
  });
});
