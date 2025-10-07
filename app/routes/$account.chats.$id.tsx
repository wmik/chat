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
import type { Route } from './+types/$account.chats.$id';
import { randomUUID } from 'node:crypto';
import { ChatInterface } from '~/components/organisms/chat-interface';

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
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Chats</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Untitled Chat</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <ChatInterface data={{ messages }} />
      </SidebarInset>
    </SidebarProvider>
  );
}
