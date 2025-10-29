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
  LayoutDashboard,
  Users,
  ClipboardList,
  Building2,
  TrendingUp,
  Settings,
  Bell,
  User
} from 'lucide-react';

const adminNavItems = [
  {
    title: "System Dashboard",
    url: "/dashboard/admin",
    icon: LayoutDashboard,
  },
  {
    title: "User Management",
    url: "/dashboard/admin/users",
    icon: Users,
  },
  {
    title: "All Requests",
    url: "/dashboard/admin/requests",
    icon: ClipboardList,
  },
  {
    title: "Yard Operations",
    url: "/dashboard/admin/yard",
    icon: Building2,
  },
  {
    title: "Analytics & Reports",
    url: "/dashboard/admin/analytics",
    icon: TrendingUp,
  },
  {
    title: "System Settings",
    url: "/dashboard/admin/settings",
    icon: Settings,
  },
  {
    title: "Notifications",
    url: "/dashboard/admin/notifications",
    icon: Bell,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
];

export function AdminSidebar({ user }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>System Administration</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {adminNavItems.map((item) => (
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