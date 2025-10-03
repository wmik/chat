import type { ActionFunctionArgs } from 'react-router';
import { randomUUID } from 'node:crypto';
import { tasks } from '@trigger.dev/sdk';
import { askTask } from '~/trigger/ask';

export async function ask({ request, params }: ActionFunctionArgs) {
  let formData = await request.formData();
  let { query } = Object.fromEntries(formData) as Record<string, string>;
  let task = await tasks.trigger<typeof askTask>('ask', {
    thread: params?.id,
    query
  });

  return {
    data: {
      task
    },
    errors: null,
    metadata: {
      action: 'ask',
      timestamp: new Date().toISOString()
    }
  };
}
