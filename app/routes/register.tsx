import { RegistrationForm } from '~/components/registration-form';
import type { Route } from './+types/register';
import { handler } from '~/api/handler';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Chat -– Registration' },
    { name: 'description', content: 'Register to chat application' }
  ];
}

export function action(args: Route.ActionArgs) {
  return handler('register', args);
}

export default function RegistrationPage({ actionData }: Route.ComponentProps) {
  let navigate = useNavigate();

  useEffect(() => {
    if (
      actionData?.errors?.length &&
      actionData?.metadata?.action === 'register'
    ) {
      toast.error('Registration Failed!', {
        description: actionData?.errors?.slice()?.shift()
      });
    }

    if (
      actionData?.data?.membership &&
      actionData?.metadata?.action === 'register'
    ) {
      toast('Registration complete.', {
        description: 'Redirecting to login page...please wait'
      });
      navigate('/login', { replace: true });
    }
  }, [actionData]);

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <RegistrationForm />
      </div>
    </div>
  );
}
