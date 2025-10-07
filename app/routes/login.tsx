import { LoginForm } from '~/components/login-form';
import type { Route } from './+types/login';
import { handler } from '~/api/handler';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Chat – Login' },
    { name: 'description', content: 'Login to chat application' }
  ];
}

export function action(args: Route.ActionArgs) {
  return handler('login', args);
}

export default function LoginPage({ actionData }: Route.ComponentProps) {
  useEffect(() => {
    if (actionData?.data?.code && actionData?.metadata?.action === 'login') {
      toast('Magic link sent.', {
        description: 'Check your inbox or spam folder.'
      });
    }
  }, [actionData]);

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
