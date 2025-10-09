import { getSession, verifyLoginCode } from '~/database/auth.server';
import type { Route } from './+types/magic';
import { redirect } from 'react-router';

export async function loader({ request }: Route.LoaderArgs) {
  let url = new URL(request.url);
  let code = url.searchParams.get('code');
  let verified = await verifyLoginCode(code as string);
  let { signIn, getHeaders } = await getSession(request);

  if (verified) {
    await signIn(
      verified?.membership?.account_id,
      verified?.membership?.organization_id
    );

    let headers = new Headers();

    await getHeaders(headers);

    throw redirect(`/${verified?.membership?.organization_id}`, {
      status: 303,
      headers
    });
  }

  throw redirect('/invalid');
}

export default function () {
  return null;
}
