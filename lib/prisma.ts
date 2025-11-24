// Example runtime Prisma client creation for Prisma v7+.
// IMPORTANT: Check Prisma 7 API — the exact constructor shape may differ. Adapt per docs.
import { PrismaClient } from '@prisma/client';

// If Prisma v7 requires an `adapter` or `accelerateUrl`, pass them here.
// Use `as any` temporarily if TS types don't match yet; update once your Prisma version/types are installed.
const clientOptions: any = {};

// Provide direct DB connection via adapter (example)
if (process.env.DATABASE_URL) {
  clientOptions.adapter = { url: process.env.DATABASE_URL }; // adapt shape to Prisma 7 API
}

// If you use Accelerate:
// if (process.env.PRISMA_ACCELERATE_URL) {
//   clientOptions.accelerateUrl = process.env.PRISMA_ACCELERATE_URL;
//}

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma ?? new PrismaClient(clientOptions);
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export { prisma };