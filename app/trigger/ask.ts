import { logger, task, wait } from '@trigger.dev/sdk/v3';
import { randomUUID } from 'node:crypto';
import { upsertThread } from '~/database/threads.server';

type AskPayload = {
  account?: string;
  organization?: string;
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

    let response = await fetch(
      'https://raw.githubusercontent.com/wmik/use-media-recorder/refs/heads/main/readme.md'
    );

    if (response.ok) {
      let thread = await upsertThread(
        {
          id: payload?.thread,
          account_id: payload?.account as string,
          organization_id: payload?.organization as string
        },
        [
          {
            content: await response.clone().text(),
            author: 'assistant'
          }
        ]
      );

      return {
        data: {
          thread
        },
        errors: null,
        metadata: {
          action: 'ask',
          timestamp: new Date().toISOString()
        }
      };
    }
    return {
      data: null,
      errors: ['Unable to add message to thread'],
      metadata: {
        action: 'ask',
        timestamp: new Date().toISOString()
      }
    };
  }
});
