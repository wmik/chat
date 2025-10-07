import { verifyCode } from '~/database/auth.server';
import type { Route } from './+types/magic';
import { redirect } from 'react-router';

export async function loader({ request }: Route.LoaderArgs) {
  let url = new URL(request.url);
  let code = url.searchParams.get('code');
  let session = await verifyCode(code as string);

  if (session) {
    throw redirect(`/${session?.organization_id}`, {
      status: 302
    });
  }

  throw redirect('/invalid');
}

export default function () {
  return null;
}
