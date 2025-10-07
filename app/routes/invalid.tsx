import type { Route } from './+types/invalid';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
  EmptyHeader,
  EmptyMedia
} from '~/components/ui/empty';
import { Button } from '~/components/ui/button';
import { Link2OffIcon } from 'lucide-react';
import { Link } from 'react-router';

export default function InvalidPage({}: Route.ComponentProps) {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Link2OffIcon />
          </EmptyMedia>
          <EmptyTitle>Invalid sign in link</EmptyTitle>
          <EmptyDescription>
            The sign link provided is either expired or invalid.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link to="/login">Request a new sign in link</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
