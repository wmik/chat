import type { ActionFunctionArgs } from 'react-router';
import { randomUUID } from 'node:crypto';

export async function ask({ request, params }: ActionFunctionArgs) {
  let formData = await request.formData();
  let { message } = Object.fromEntries(formData) as Record<string, string>;
  let { id } = params;

  await new Promise(resolve => setTimeout(resolve, 2000));

  if (!id) {
    id = randomUUID();
  }

  return {
    data: {
      thread: {
        id,
        created_at: new Date(),
        messages: [
          {
            id: randomUUID(),
            author: 'human',
            content: message,
            created_at: new Date(),
            thread_id: id
          }
        ]
      }
    },
    errors: null,
    metadata: {
      action: 'ask',
      timestamp: new Date().toISOString()
    }
  };
}
