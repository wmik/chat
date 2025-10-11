import type { ActionFunctionArgs } from 'react-router';
import { ask } from '~/api/ask';
import { login, register } from '~/api/auth';

type HandlerResponse = {
  data: any;
  errors: string[] | null;
  metadata: Record<string, any>;
};

const handlers: Record<
  string,
  (args: ActionFunctionArgs) => Promise<HandlerResponse>
> = {
  ask,
  login,
  register,
  refresh: () =>
    Promise.resolve({
      data: null,
      errors: null,
      metadata: { action: 'refresh', timestamp: new Date().toISOString() }
    })
};

export async function handler(action: string, args: ActionFunctionArgs) {
  let handler = handlers[action];

  if (!handler) {
    throw new Error(`Handler for action ${action} not found`);
  }

  return await handler(args);
}
