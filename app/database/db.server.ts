import { PrismaClient } from '~/generated/prisma/client';

export const db = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'info', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' }
  ],
  datasources: { db: { url: process.env.DATABASE_URL } }
});

const LOG_THRESHOLD = 50;

db.$on('query', e => {
  if (e.duration < LOG_THRESHOLD) {
    return;
  }
  console.log(`db:query - ${e.duration}ms - ${e.query}`);
});

// make the connection eagerly so the first request doesn't have to wait
void db.$connect();
