"use client";

import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Truck, ArrowRight } from "lucide-react";
import { toast } from "sonner";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        router.push(callbackUrl);
      }
    };
    checkSession();
  }, [callbackUrl, router]);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      toast.loading("Signing you in.....");

      const result = await signIn("google", {
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Failed to sign in. Please try again.");
        setLoading(false);
      } else {
        toast.success("Signed in successfully! Redirecting...");
        router.push(callbackUrl);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="bg-teal-100 rounded-full p-3">
                <Truck className="h-8 w-8 text-teal-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                TransportFlow
              </h1>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Sign In Required
            </h2>
            <p className="text-gray-600 text-sm">
              Please sign in to access your dashboard and continue coordinating
              operations.
            </p>
          </div>

          <div className="space-y-6">
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-200 text-gray-700 px-6 py-4 rounded-xl font-medium hover:border-gray-300 hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-3 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600"></div>
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our terms of service and privacy
                policy.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Made with ❤️ by{" "}
              <span className="font-medium text-gray-700">Zoya</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
