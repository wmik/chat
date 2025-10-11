import { useEffect } from 'react';
import type { Route } from './+types/$account.chats.$thread';
import type { UIMatch } from 'react-router';
import { redirect, useNavigation, useSubmit } from 'react-router';
import { handler } from '~/api/handler';
import { Crumbs } from '~/components/crumbs';
import { ChatInterface } from '~/components/organisms/chat-interface';
import { checkRole, getSession } from '~/database/auth.server';
import { getThreadById } from '~/database/threads.server';
import { toast } from 'sonner';

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

export async function action(args: Route.ActionArgs) {
  let formData = await args?.request?.clone()?.formData();
  let action = formData?.get('_action')?.toString() as string;

  return handler(action, args);
}

export async function loader({ request, params }: Route.LoaderArgs) {
  let { getUser } = await getSession(request);
  let session = await getUser();

  if (!session) {
    throw redirect('/login');
  }

  let authorized = checkRole(session, {
    account: ['ADMIN'],
    organization: ['OWNER']
  });
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

export default function ChatPage({
  loaderData,
  actionData
}: Route.ComponentProps) {
  let { data } = loaderData ?? {};
  let { thread } = data ?? {};
  let { messages } = thread ?? {};
  let navigation = useNavigation();
  let submit = useSubmit();

  useEffect(() => {
    if (
      navigation.state === 'submitting' &&
      navigation.formData?.get('_action') === 'ask'
    ) {
      toast.loading('Thinking...', {
        description:
          'Please wait while the AI searches for relevant information.',
        duration: Infinity
      });
    }
  }, [navigation]);

  useEffect(() => {
    if (Number(actionData?.errors?.length) > 0) {
      toast.dismiss();
      toast.error('Issues detected', {
        description: actionData?.errors?.slice()?.shift()
      });
    }
  }, [actionData]);

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
                toast.success('Done', {
                  description: 'AI responded successfully'
                });
                let formData = new FormData();

                formData.append('_action', 'refresh');

                submit(formData, { replace: true, method: 'post' });
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

  return <ChatInterface data={{ messages }} />;
}
