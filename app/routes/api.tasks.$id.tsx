import { runs } from '@trigger.dev/sdk';
import type { Route } from './+types/api.tasks.$id';

export async function loader({ params }: Route.LoaderArgs) {
  let task = await runs.retrieve(params?.id);

  return {
    data: {
      task
    },
    metadata: {
      timestamp: new Date().toISOString()
    }
  };
}
