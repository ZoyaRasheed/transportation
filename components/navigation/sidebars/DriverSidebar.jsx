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
  BarChart3,
  Truck,
  MapPin,
  ClipboardList,
  Bell,
  User
} from 'lucide-react';

const driverNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard/driver",
    icon: BarChart3,
  },
  {
    title: "My Assignments",
    url: "/dashboard/driver/assignments",
    icon: Truck,
  },
  {
    title: "Current Trip",
    url: "/dashboard/driver/current-trip",
    icon: MapPin,
  },
  {
    title: "Trip History",
    url: "/dashboard/driver/history",
    icon: ClipboardList,
  },
  {
    title: "Notifications",
    url: "/dashboard/driver/notifications",
    icon: Bell,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
];

export function DriverSidebar({ user }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Driver Portal</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {driverNavItems.map((item) => (
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
