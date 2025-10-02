import type { Route } from './+types/_index';
import { ChatForm } from '~/components/organisms/chat-form';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Chat' },
    { name: 'description', content: 'Chat application' }
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.VALUE_FROM_EXPRESS };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <main className="flex flex-col items-center gap-4 max-w-7xl mx-auto mt-50">
      <h1 className="text-5xl font-semibold">Start a new conversation</h1>
      <p className="text-xl text-muted-foreground">
        Ask a question or write a prompt to start gathering ideas.
      </p>
      <ChatForm name="query" />
    </main>
  );
}
