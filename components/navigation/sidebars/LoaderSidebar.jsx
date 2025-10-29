"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  ClipboardList,
  Plus,
  BarChart3,
  Bell,
  User
} from 'lucide-react';

const loaderNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard/loader",
    icon: BarChart3,
  },
  {
    title: "My Requests",
    url: "/dashboard/loader/requests",
    icon: ClipboardList,
  },
  {
    title: "Create Request",
    url: "/dashboard/loader/create",
    icon: Plus,
  },
  {
    title: "Notifications",
    url: "/dashboard/loader/notifications",
    icon: Bell,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
];

export function LoaderSidebar({ user }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Loader Portal</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {loaderNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
              >
                <Link href={item.url}>
                  <item.icon className="size-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}