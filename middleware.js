import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith('/dashboard')) {
      if (!token) {
        return NextResponse.redirect(new URL('/', req.url));
      }

      const userRole = token.role;
      const requestedRole = pathname.split('/')[2];

      if (userRole !== requestedRole) {
        return NextResponse.redirect(new URL(`/dashboard/${userRole}`, req.url));
      }
    }

    if (pathname.startsWith('/api/admin')) {
      if (!token || token.role !== 'admin') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        if (pathname === '/') {
          return true;
        }

        if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/user')) {
          return !!token;
        }

        if (pathname.startsWith('/api/admin')) {
          return token?.role === 'admin';
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/user/:path*',
    '/api/admin/:path*'
  ]
};