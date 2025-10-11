import { Button } from '~/components/ui/button';
import type { Route } from './+types/_index';
import { Link } from 'react-router';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Chat' },
    { name: 'description', content: 'Chat application' }
  ];
}

export default function Landing({}: Route.ComponentProps) {
  return (
    <article className="flex flex-col items-center mt-48 gap-10">
      <h1 className="text-8xl font-semibold max-w-4xl text-center">Chat</h1>

      <p className="text-muted-foreground">An interactive AI chat assistant.</p>

      <p className="flex gap-4 items-center">
        <Button asChild>
          <Link to="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link to="/register">Register</Link>
        </Button>
      </p>
    </article>
  );
}
