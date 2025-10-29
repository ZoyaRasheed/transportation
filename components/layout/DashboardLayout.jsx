"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/navigation/AppSidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Bell, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import axios from "axios";
import Link from "next/link";

export function DashboardLayout({ children }) {
  const handleSignOut = async () => {
    try {
      // Call our logout API first to clean up server-side data
      await axios.post('/api/auth/logout');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with signOut even if API fails
    } finally {
      // Always sign out from NextAuth
      signOut({ callbackUrl: '/' });
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/notifications">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sign out</span>
            </Button>
          </div>
        </header>

        <div className="flex-1 p-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}