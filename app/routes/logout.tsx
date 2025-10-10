import type { Route } from './+types/logout';
import { getSession } from '~/database/auth.server';
import { redirect } from 'react-router';

export async function loader({ request }: Route.LoaderArgs) {
  try {
    let sessionObject = await getSession(request);

    sessionObject.signOut();

    return redirect('/', { headers: await sessionObject.getHeaders() });
  } catch (error) {
    return redirect('/');
  }
}
