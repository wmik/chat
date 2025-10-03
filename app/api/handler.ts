import type { ActionFunctionArgs } from 'react-router';
import { ask } from '~/api/ask';

type HandlerResponse = {
  data: any;
  errors: string[] | null;
  metadata: Record<string, any>;
};

const handlers: Record<
  string,
  (args: ActionFunctionArgs) => Promise<HandlerResponse>
> = {
  ask
};

export async function handler(action: string, args: ActionFunctionArgs) {
  let handler = handlers[action];

  if (!handler) {
    throw new Error(`Handler for action ${action} not found`);
  }

  return await handler(args);
}
