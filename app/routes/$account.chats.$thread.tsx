import type { Route } from './+types/$account.chats.$thread';
import type { UIMatch } from 'react-router';
import { redirect } from 'react-router';
import { Crumbs } from '~/components/crumbs';
import { ChatInterface } from '~/components/organisms/chat-interface';
import { getSession } from '~/database/auth.server';
import { getThreadById } from '~/database/threads.server';

export const handle = {
  breadcrumb: ({
    params
  }: UIMatch<Route.ComponentProps['loaderData'], any>) => {
    return (
      <Crumbs
        data={[
          { children: 'Chats', href: `/${params?.account}` },
          {
            children: 'Untitled Chat',
            href: `/${params?.account}/chats/${params?.thread}`
          }
        ]}
      />
    );
  }
};

export async function loader({ request, params }: Route.LoaderArgs) {
  let { getUser } = await getSession(request);
  let session = await getUser();

  if (!session) {
    throw redirect('/login');
  }

  let admin = session?.account?.role === 'ADMIN';
  let owner = session?.role === 'OWNER';
  let authorized = admin || owner;
  let thread = await getThreadById(params?.thread);

  if (thread) {
    return {
      data: {
        thread
      },
      errors: null,
      metadata: {
        timestamp: new Date().toISOString()
      }
    };
  }

  return null;
}

export default function ChatPage({ loaderData }: Route.ComponentProps) {
  let { data } = loaderData ?? {};
  let { thread } = data ?? {};
  let { messages } = thread ?? {};

  return <ChatInterface data={{ messages }} />;
}
