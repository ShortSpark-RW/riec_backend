/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as bcrypt from 'bcrypt';

async function main() {
  const prisma = new PrismaClient();
  try {
    const admins = await prisma.adminUser.findMany();
    for (const a of admins) {
      const existing = await (prisma as any).user.findUnique({
        where: { email: a.email },
      });
      if (existing) {
        console.log(`User exists for ${a.email}, skipping`);
        continue;
      }
      await (prisma as any).user.create({
        data: { email: a.email, passwordHash: a.passwordHash, role: 'ADMIN' },
      });
      console.log(`Migrated admin ${a.email}`);
    }
    console.log('Migration complete');
  } catch (err) {
    console.error('Migration failed', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
