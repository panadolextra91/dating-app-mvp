import { PrismaClient } from '@prisma/client';

export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE "Availability", "Match", "Like", "User" RESTART IDENTITY CASCADE;
  `);
}
