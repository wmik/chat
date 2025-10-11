import { logger, task } from '@trigger.dev/sdk/v3';
import { upsertThread } from '~/database/threads.server';
import { queryWithStreaming } from '~/llm.server';

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
    let result = await queryWithStreaming(
      payload?.thread as string,
      payload?.query
    );

    if (result?.answer) {
      let thread = await upsertThread(
        {
          id: payload?.thread,
          account_id: payload?.account as string,
          organization_id: payload?.organization as string
        },
        [
          {
            content: result?.answer,
            author: 'assistant',
            custom: {
              result: {
                answer: result?.answer,
                sources: result?.sources?.map(source => ({ ...source }))
              }
            }
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
