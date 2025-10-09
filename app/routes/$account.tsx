import { AppSidebar } from '~/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '~/components/ui/breadcrumb';
import { Separator } from '~/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from '~/components/ui/sidebar';
import type { Route } from './+types/$account';
import { Outlet, useMatches, type UIMatch } from 'react-router';
import { Fragment } from 'react/jsx-runtime';
import type { ReactNode } from 'react';

type Breadcrumb = (props: UIMatch) => ReactNode;

export default function ChatPage({}: Route.ComponentProps) {
  let matches = useMatches() as UIMatch<unknown, { breadcrumb: Breadcrumb }>[];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            {matches
              ?.filter(match => match?.handle && match?.handle?.breadcrumb)
              ?.map(match => (
                <Fragment
                  key={match?.id}
                  children={match.handle.breadcrumb(match)}
                />
              ))}
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
