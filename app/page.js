"use client";

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Truck, Users, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingScreen } from '@/components/ui/loading';
import { toast } from 'sonner';
import { setupPushNotifications } from '@/lib/push-notifications';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (session) {
      const role = session.user.role || 'loader';
      toast.success(`Welcome back! Redirecting to your dashboard...`);

      if (typeof window !== 'undefined') {
        setupPushNotifications().then(token => {
          if (token) {
            console.log('Push notifications enabled');
          }
        });
      }

      setTimeout(() => {
        router.push(`/dashboard/${role}`);
      }, 1500);
    }
  }, [session, status, router]);

  const handleSignIn = async () => {
    try {
      toast.loading('Signing you in...');
      await signIn('google');
    } catch (error) {
      toast.error('Failed to sign in. Please try again.');
    }
  };

  if (status === 'loading') {
    return (
      <LoadingScreen
        title="TransportFlow"
        subtitle="Initializing your transportation coordination system..."
      />
    );
  }

  if (session) {
    const userRole = session.user.role || 'loader';
    return (
      <LoadingScreen
        variant="redirect"
        title="Welcome back!"
        subtitle={`Redirecting to your ${userRole} dashboard...`}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="overflow-hidden flex flex-col md:grid md:grid-cols-2 gap-0">
            <CardContent className="order-2 md:order-1 p-6 md:p-12 bg-linear-to-br from-teal-600 to-teal-800 text-white">
              <div className="flex items-center space-x-3 mb-4 md:mb-6">
                <div className="bg-white/20 rounded-full p-2">
                  <Truck className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <h1 className="text-xl md:text-2xl font-bold">TransportFlow</h1>
              </div>

              <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 leading-tight">
                Transportation & Loading Coordination System
              </h2>

              <p className="text-teal-100 text-base md:text-lg mb-6 md:mb-8 leading-relaxed">
                Streamline your operations with real-time coordination between loading and transportation departments.
              </p>

              <div className="space-y-3 md:space-y-4 hidden md:block">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-300" />
                  <span className="text-sm md:text-base">Real-time truck request management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-300" />
                  <span className="text-sm md:text-base">Instant notifications to mobile devices</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-300" />
                  <span className="text-sm md:text-base">Performance analytics and reporting</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 md:hidden">
                {[
                  { icon: CheckCircle, label: "Real-time" },
                  { icon: CheckCircle, label: "Notifications" },
                  { icon: CheckCircle, label: "Analytics" }
                ].map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex flex-col items-center p-2 bg-white/10 text-white border-0">
                    <item.icon className="h-4 w-4 mb-1" />
                    <span className="text-xs">{item.label}</span>
                  </Badge>
                ))}
              </div>
            </CardContent>

            <CardContent className="order-1 md:order-2 p-6 md:p-12 flex flex-col justify-center">
              <CardHeader className="p-0 text-center mb-6 md:mb-8">
                <CardTitle className="text-xl md:text-2xl mb-2">Welcome Back</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Sign in to access your department dashboard
                </CardDescription>
              </CardHeader>

              <div className="space-y-4 md:space-y-6">
                <Button
                  onClick={handleSignIn}
                  variant="outline"
                  size="lg"
                  className="w-full py-3 md:py-4 h-auto"
                >
                  <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                  <ArrowRight className="h-4 w-4 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>

                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  {[
                    { icon: Users, label: "Multi-Dept", sublabel: "Access", color: "blue" },
                    { icon: Clock, label: "Real-time", sublabel: "Updates", color: "green" },
                    { icon: Truck, label: "Fleet", sublabel: "Management", color: "purple" }
                  ].map((item, index) => (
                    <Card key={index} className="p-3 md:p-4 text-center">
                      <item.icon className={`h-5 w-5 md:h-6 md:w-6 mx-auto mb-1 md:mb-2 text-${item.color}-600`} />
                      <div className="text-xs md:text-sm font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground hidden md:block">{item.sublabel}</div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t text-center">
                <p className="text-xs md:text-sm text-muted-foreground">
                  Made with ❤️ by <span className="font-medium">Zoya</span>
                </p>
              </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
