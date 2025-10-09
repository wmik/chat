import { handler } from '~/api/handler';
import type { Route } from './+types/$account._index';
import { ChatForm } from '~/components/organisms/chat-form';
import {
  useNavigation,
  useNavigate,
  type UIMatch,
  redirect
} from 'react-router';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { Crumbs } from '~/components/crumbs';
import { getSession } from '~/database/auth.server';
import {
  listOrganizationThreads,
  listUserThreads
} from '~/database/threads.server';

export const handle = {
  breadcrumb: ({ params }: UIMatch) => {
    return (
      <Crumbs data={[{ children: 'Chats', href: `/${params?.account}` }]} />
    );
  }
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Chat – Home' },
    { name: 'description', content: 'Chat application' }
  ];
}

export function action(args: Route.ActionArgs) {
  return handler('ask', args);
}

export async function loader({ request }: Route.LoaderArgs) {
  let { getUser } = await getSession(request);
  let session = await getUser();

  if (!session) {
    throw redirect('/login');
  }

  let admin = session?.account?.role === 'ADMIN';
  let owner = session?.role === 'OWNER';
  let authorized = admin || owner;

  let threads = authorized
    ? await listOrganizationThreads(session?.organization_id as string)
    : await listUserThreads(session?.account_id);

  return {
    data: {
      session,
      threads
    },
    errors: null,
    metadata: {
      timestamp: new Date().toISOString()
    }
  };
}

export default function Home({ actionData }: Route.ComponentProps) {
  let navigation = useNavigation();
  let navigate = useNavigate();

  useEffect(() => {
    if (
      navigation.state === 'submitting' &&
      navigation.formData?.get('_action') === 'ask'
    ) {
      toast.loading('Creating thread...', {
        description: 'Please wait while we create a new chat thread.',
        duration: Infinity
      });
    }
  }, [navigation]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const INTERVAL = 5000;

    if (actionData?.metadata?.action === 'ask' && actionData?.data?.task?.id) {
      interval = setInterval(() => {
        fetch(`/api/tasks/${actionData?.data?.task?.id}`).then(
          async response => {
            if (response.ok) {
              let { data } = await response.json();

              const FAIL = [
                'CANCELED',
                'FAILED',
                'CRASHED',
                'SYSTEM_FAILURE',
                'DELAYED',
                'EXPIRED',
                'TIMED_OUT'
              ];

              if (data?.task?.status === 'COMPLETED') {
                toast.dismiss();
                toast.success('Chat thread created successfully', {
                  description: 'Redirecting to messages...please wait'
                });
                navigate(
                  `/${data.task?.output?.data?.thread?.organization_id}/chats/${data.task?.output?.data?.thread?.id}`
                );
                return clearInterval(interval);
              }

              if (FAIL?.includes(data?.task?.status)) {
                toast.dismiss();
                toast.error('Failed to create chat thread', {
                  description: data?.task?.error?.message
                });
                return clearInterval(interval);
              }
            }
          }
        );
      }, INTERVAL);
    }

    return () => {
      clearInterval(interval);
    };
  }, [actionData]);

  return (
    <main className="flex flex-col items-center gap-4 max-w-7xl mx-auto mt-50 w-full">
      <h1 className="text-5xl font-semibold">Start a new conversation</h1>
      <p className="text-xl text-muted-foreground">
        Ask a question or write a prompt to start gathering ideas.
      </p>
      <ChatForm name="query" action="ask" />
    </main>
  );
}
