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
  Truck,
  BarChart3,
  Users,
  Bell,
  User
} from 'lucide-react';

const dispatcherNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard/dispatcher",
    icon: BarChart3,
  },
  {
    title: "Pending Requests",
    url: "/dashboard/dispatcher/requests",
    icon: ClipboardList,
  },
  {
    title: "Fleet Management",
    url: "/dashboard/dispatcher/fleet",
    icon: Truck,
  },
  {
    title: "Driver Management",
    url: "/dashboard/dispatcher/drivers",
    icon: Users,
  },
  {
    title: "Notifications",
    url: "/dashboard/dispatcher/notifications",
    icon: Bell,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
];

export function DispatcherSidebar({ user }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Dispatch Center</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {dispatcherNavItems.map((item) => (
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