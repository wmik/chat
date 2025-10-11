'use client';

import * as React from 'react';
import {
  AudioWaveform,
  BuildingIcon,
  Command,
  GalleryVerticalEnd,
  MessageCircleIcon,
  Settings2
} from 'lucide-react';

import { NavMain } from '~/components/nav-main';
import { NavRecents } from '~/components/nav-recents';
import { NavUser } from '~/components/nav-user';
import { OrganizationSwitcher } from '~/components/organization-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '~/components/ui/sidebar';
import { useLoaderData } from 'react-router';
import type { Route } from '../routes/+types/$account';

// This is sample data.
const data = {
  user: {
    name: 'jeandoe',
    email: 'jeandoe@provider.domain',
    avatar: 'https://avatar.iran.liara.run/public/14'
  },
  teams: [
    {
      name: 'Eco Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise'
    },
    {
      name: 'Sound Corp.',
      logo: AudioWaveform,
      plan: 'Startup'
    },
    {
      name: 'Nexus Corp.',
      logo: Command,
      plan: 'Free'
    }
  ],
  navMain: [
    {
      title: 'Chats',
      url: '#',
      icon: MessageCircleIcon,
      isActive: true,
      items: [
        {
          title: 'History',
          url: '#'
        },
        {
          title: 'Starred',
          url: '#'
        },
        {
          title: 'Configuration',
          url: '#'
        }
      ]
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '#'
        },
        {
          title: 'Team',
          url: '#'
        },
        {
          title: 'Billing',
          url: '#'
        },
        {
          title: 'Limits',
          url: '#'
        }
      ]
    }
  ],
  recents: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: null //Frame
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: null //PieChart
    },
    {
      name: 'Travel',
      url: '#',
      icon: null //Map
    }
  ]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  let loaderData = useLoaderData<Route.ComponentProps['loaderData']>();
  let { session, organizations, threads } = loaderData?.data ?? {};

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganizationSwitcher
          organizations={
            organizations?.map(organization => ({
              name: organization?.name,
              logo: BuildingIcon,
              plan: 'Free'
            })) ?? []
          }
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavRecents
          recents={threads?.map(thread => ({
            name: thread?.title ?? thread?.id,
            url: `/${thread?.organization_id}/chats/${thread?.id}`,
            icon: null
          }))}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            avatar: 'https://avatar.iran.liara.run/public/14',
            ...session?.account
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
