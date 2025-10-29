import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export function withRoles(allowedRoles) {
  return function(handler) {
    return async function(request) {
      try {
        const session = await getServerSession(authOptions);

        if (!session) {
          return NextResponse.json({
            success: false,
            statusCode: 401,
            request: {
              method: request.method,
              url: request.url
            },
            message: 'Authentication required',
            timestamp: new Date().toISOString()
          }, { status: 401 });
        }

        await connectDB();

        const user = await User.findOne({ email: session.user.email });
        if (!user || !user.isActive) {
          return NextResponse.json({
            success: false,
            statusCode: 403,
            request: {
              method: request.method,
              url: request.url
            },
            message: 'User not found or inactive',
            timestamp: new Date().toISOString()
          }, { status: 403 });
        }

        if (!allowedRoles.includes(user.role)) {
          return NextResponse.json({
            success: false,
            statusCode: 403,
            request: {
              method: request.method,
              url: request.url
            },
            message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
            timestamp: new Date().toISOString()
          }, { status: 403 });
        }

        return handler(request, { session, user });

      } catch (error) {
        console.error('Role middleware error:', error);
        return NextResponse.json({
          success: false,
          statusCode: 500,
          request: {
            method: request.method,
            url: request.url
          },
          message: 'Internal server error',
          timestamp: new Date().toISOString()
        }, { status: 500 });
      }
    };
  };
}