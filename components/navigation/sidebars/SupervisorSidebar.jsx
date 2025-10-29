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
  ClipboardList,
  Building2,
  TrendingUp,
  Users,
  Bell,
  User
} from 'lucide-react';

const supervisorNavItems = [
  {
    title: "Overview Dashboard",
    url: "/dashboard/supervisor",
    icon: LayoutDashboard,
  },
  {
    title: "All Operations",
    url: "/dashboard/supervisor/operations",
    icon: ClipboardList,
  },
  {
    title: "Yard Status",
    url: "/dashboard/supervisor/yard",
    icon: Building2,
  },
  {
    title: "Reports & Analytics",
    url: "/dashboard/supervisor/reports",
    icon: TrendingUp,
  },
  {
    title: "Team Management",
    url: "/dashboard/supervisor/team",
    icon: Users,
  },
  {
    title: "Notifications",
    url: "/dashboard/supervisor/notifications",
    icon: Bell,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
];

export function SupervisorSidebar({ user }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Supervision Center</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {supervisorNavItems.map((item) => (
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