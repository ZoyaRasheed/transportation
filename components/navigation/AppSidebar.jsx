"use client";

import { useSession } from 'next-auth/react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { LoaderSidebar } from './sidebars/LoaderSidebar';
import { SwitcherSidebar } from './sidebars/SwitcherSidebar';
import { DispatcherSidebar } from './sidebars/DispatcherSidebar';
import { SupervisorSidebar } from './sidebars/SupervisorSidebar';
import { AdminSidebar } from './sidebars/AdminSidebar';
import { DriverSidebar } from './sidebars/DriverSidebar';
import { Truck, User } from 'lucide-react';
import Link from 'next/link';

export function AppSidebar() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <Sidebar>
        <SidebarContent>
          <div className="p-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-6 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  if (!session?.user) {
    return null;
  }

  const userRole = session.user.role || 'loader';

  const renderRoleSidebar = () => {
    switch (userRole) {
      case 'loader':
        return <LoaderSidebar user={session.user} />;
      case 'switcher':
        return <SwitcherSidebar user={session.user} />;
      case 'dispatcher':
        return <DispatcherSidebar user={session.user} />;
      case 'supervisor':
        return <SupervisorSidebar user={session.user} />;
      case 'admin':
        return <AdminSidebar user={session.user} />;
      case 'driver':
        return <DriverSidebar user={session.user} />;
      default:
        return <LoaderSidebar user={session.user} />;
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={`/dashboard/${userRole}`}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Truck className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">TransportFlow</span>
                  <span className="text-xs text-muted-foreground">
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Portal
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {renderRoleSidebar()}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarMenu className="p-2">
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/profile" className="flex items-center gap-2">
              <User className="size-4" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{session.user.name}</span>
                <span className="text-xs text-muted-foreground">{session.user.email}</span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <SidebarRail />
    </Sidebar>
  );
}