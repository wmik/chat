import type { messages, threads } from '~/generated/prisma';
import type { InputJsonValue } from '~/generated/prisma/runtime/library';
import { db } from '~/database/db.server';
import { nanoid } from 'nanoid';

export function listLatestThreads(limit = 10) {
  return db.threads.findMany({ take: limit, orderBy: { created_at: 'asc' } });
}

export function getThreadById(id: string) {
  return db.threads.findUnique({ where: { id }, include: { messages: true } });
}

export async function upsertThread(thread: threads, messages?: messages[]) {
  return await db.$transaction(async tx => {
    await tx.users_sync.findUniqueOrThrow({ where: { id: thread.user_id } });

    return tx.threads.upsert({
      where: {
        id: thread.id
      },
      create: {
        ...thread,
        custom: thread?.custom as InputJsonValue,
        messages: {
          createMany: {
            data:
              messages?.map(message => ({
                ...message,
                id: message?.id ?? nanoid(),
                custom: message?.custom as InputJsonValue
              })) ?? []
          }
        }
      },
      update: {
        ...thread,
        custom: thread?.custom as InputJsonValue
      }
    });
  });
}
