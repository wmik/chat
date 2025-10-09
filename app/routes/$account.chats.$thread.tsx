import type { Route } from './+types/$account.chats.$thread';
import { randomUUID } from 'node:crypto';
import type { UIMatch } from 'react-router';
import { Crumbs } from '~/components/crumbs';
import { ChatInterface } from '~/components/organisms/chat-interface';

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

export async function loader({ context }: Route.LoaderArgs) {
  let response = await fetch(
    'https://raw.githubusercontent.com/wmik/use-media-recorder/refs/heads/main/readme.md'
  );

  if (response.ok) {
    let threadId = randomUUID();

    return {
      data: {
        thread: {
          id: threadId,
          created_at: new Date(),
          messages: [
            {
              id: randomUUID(),
              author: 'human',
              content: 'Describe the use-media-recorder',
              created_at: new Date(),
              thread_id: threadId
            },
            {
              id: randomUUID(),
              author: 'assistant',
              content: await response.clone().text(),
              created_at: new Date(),
              thread_id: threadId
            }
          ]
        }
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
