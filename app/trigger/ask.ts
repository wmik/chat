import { logger, task, wait } from '@trigger.dev/sdk/v3';
import { randomUUID } from 'node:crypto';

type AskPayload = {
  thread?: string;
  query: string;
};

export const askTask = task({
  id: 'ask',
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload: AskPayload, { ctx }) => {
    logger.log('Ask!', { payload, ctx });

    await wait.for({ seconds: 5 });

    return {
      data: {
        thread: {
          id: payload?.thread ?? randomUUID(),
          created_at: new Date().toISOString()
        }
      },
      errors: null,
      metadata: {
        action: 'ask',
        timestamp: new Date().toISOString()
      }
    };
  }
});
