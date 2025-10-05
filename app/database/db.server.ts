import { PrismaClient } from '~/generated/prisma';

declare global {
  var __db: PrismaClient | undefined;
}

let db: PrismaClient;

const client = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'info', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' }
  ],
  datasources: { db: { url: process.env.DATABASE_URL } }
});

const LOG_THRESHOLD = 50;

client.$on('query', e => {
  if (e.duration < LOG_THRESHOLD) {
    return;
  }
  console.log(`db:query - ${e.duration}ms - ${e.query}`);
});

if (process.env.NODE_ENV === 'production') {
  db = client;
} else {
  if (!global.__db) {
    global.__db = client;
    db = global.__db;
  }
}

// make the connection eagerly so the first request doesn't have to wait
void client.$connect();

export { db };
