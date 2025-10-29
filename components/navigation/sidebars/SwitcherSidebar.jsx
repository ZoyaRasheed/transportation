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
  Building2,
  DoorOpen,
  Clock,
  FileText,
  BarChart3,
  Bell,
  User
} from 'lucide-react';

const switcherNavItems = [
  {
    title: "Yard Overview",
    url: "/dashboard/switcher",
    icon: Building2,
  },
  {
    title: "Loading Bays",
    url: "/dashboard/switcher/bays",
    icon: DoorOpen,
  },
  {
    title: "Queue Management",
    url: "/dashboard/switcher/queue",
    icon: Clock,
  },
  {
    title: "Movements Log",
    url: "/dashboard/switcher/movements",
    icon: FileText,
  },
  {
    title: "Analytics",
    url: "/dashboard/switcher/analytics",
    icon: BarChart3,
  },
  {
    title: "Notifications",
    url: "/dashboard/switcher/notifications",
    icon: Bell,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
];

export function SwitcherSidebar({ user }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Yard Operations</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {switcherNavItems.map((item) => (
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