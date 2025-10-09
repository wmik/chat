import type { messages, threads } from '~/generated/prisma/client';
import type { InputJsonValue } from '~/generated/prisma/internal/prismaNamespace';
import { db } from '~/database/db.server';
import { uid } from '~/misc';

export function listLatestThreads(limit = 10) {
  return db.threads.findMany({ take: limit, orderBy: { created_at: 'desc' } });
}

export function getThreadById(id: string) {
  return db.threads.findUnique({ where: { id }, include: { messages: true } });
}

export function listUserThreads(accountId: string) {
  return db.threads.findMany({
    where: { account_id: accountId },
    orderBy: { created_at: 'desc' }
  });
}

export function listOrganizationThreads(organizationId: string) {
  return db.threads.findMany({
    where: { organization_id: organizationId },
    orderBy: { created_at: 'desc' }
  });
}

type ThreadsInput = Omit<Partial<threads>, 'account_id'> &
  Pick<threads, 'account_id' | 'organization_id'>;

type MessagesInput = Omit<
  Partial<messages>,
  'author' | 'content' | 'thread_id'
> &
  Pick<messages, 'author' | 'content' | 'thread_id'>;

export async function upsertThread(
  thread: ThreadsInput,
  messages?: MessagesInput[]
) {
  let input = {
    ...thread,
    id: thread?.id ?? uid(),
    custom: thread?.custom as InputJsonValue,
    messages: {
      createMany: {
        data:
          messages?.map(message => ({
            ...message,
            id: message?.id ?? uid(),
            custom: message?.custom as InputJsonValue
          })) ?? []
      }
    }
  };

  return await db.$transaction(async tx => {
    // await tx.accounts_sync.findUniqueOrThrow({ where: { id: thread.account_id } });

    return tx.threads.upsert({
      where: {
        id: thread?.id
      },
      create: input,
      update: input
    });
  });
}
