import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
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
        message: 'Not authenticated',
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    await connectDB();

    // Optional: Update last logout time or clear device tokens
    const user = await User.findOne({ email: session.user.email });
    if (user) {
      // Clear device tokens for push notifications
      user.deviceTokens = [];
      await user.save();
    }

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      statusCode: 500,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Logout failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}