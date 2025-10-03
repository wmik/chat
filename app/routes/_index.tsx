import { handler } from '~/api/handler';
import type { Route } from './+types/_index';
import { ChatForm } from '~/components/organisms/chat-form';
import { useNavigation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useEffect } from 'react';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Chat' },
    { name: 'description', content: 'Chat application' }
  ];
}

export function action(args: Route.ActionArgs) {
  return handler('ask', args);
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.VALUE_FROM_EXPRESS };
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
    if (
      actionData?.metadata?.action === 'ask' &&
      actionData?.data?.thread?.id
    ) {
      toast.dismiss();
      toast.success('Chat thread created successfully', {
        description: 'Redirecting to messages.'
      });
      navigate(`/chats/${actionData.data.thread.id}`);
    }
  }, [actionData]);

  return (
    <main className="flex flex-col items-center gap-4 max-w-7xl mx-auto mt-50">
      <h1 className="text-5xl font-semibold">Start a new conversation</h1>
      <p className="text-xl text-muted-foreground">
        Ask a question or write a prompt to start gathering ideas.
      </p>
      <ChatForm name="query" action="ask" />
    </main>
  );
}
