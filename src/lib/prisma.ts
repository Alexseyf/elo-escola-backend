import { PrismaClient, Prisma } from '@prisma/client';
import { env } from '../config/env';

const logLevels: Prisma.LogLevel[] = env.NODE_ENV === 'development' 
  ? ['info', 'warn', 'error']
  : ['error'];

export const prisma = new PrismaClient({
  log: logLevels,
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
});
