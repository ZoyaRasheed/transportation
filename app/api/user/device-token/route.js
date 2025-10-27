import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json(
        {
          success: false,
          statusCode: 401,
          request: {
            method: 'POST',
            url: '/api/user/device-token'
          },
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      );
    }

    const { deviceToken } = await request.json();
    if (!deviceToken) {
      return Response.json(
        {
          success: false,
          statusCode: 400,
          request: {
            method: 'POST',
            url: '/api/user/device-token'
          },
          message: 'Device token is required',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return Response.json(
        {
          success: false,
          statusCode: 404,
          request: {
            method: 'POST',
            url: '/api/user/device-token'
          },
          message: 'User not found',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    if (!user.deviceTokens.includes(deviceToken)) {
      user.deviceTokens.push(deviceToken);
      await user.save();
    }

    return Response.json({
      success: true,
      statusCode: 200,
      request: {
        method: 'POST',
        url: '/api/user/device-token'
      },
      message: 'Device token saved successfully',
      data: {
        tokenCount: user.deviceTokens.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Device token API error:', error);
    return Response.json(
      {
        success: false,
        statusCode: 500,
        request: {
          method: 'POST',
          url: '/api/user/device-token'
        },
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json(
        {
          success: false,
          statusCode: 401,
          request: {
            method: 'DELETE',
            url: '/api/user/device-token'
          },
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      );
    }

    const { deviceToken } = await request.json();
    if (!deviceToken) {
      return Response.json(
        {
          success: false,
          statusCode: 400,
          request: {
            method: 'DELETE',
            url: '/api/user/device-token'
          },
          message: 'Device token is required',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return Response.json(
        {
          success: false,
          statusCode: 404,
          request: {
            method: 'DELETE',
            url: '/api/user/device-token'
          },
          message: 'User not found',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    user.deviceTokens = user.deviceTokens.filter(token => token !== deviceToken);
    await user.save();

    return Response.json({
      success: true,
      statusCode: 200,
      request: {
        method: 'DELETE',
        url: '/api/user/device-token'
      },
      message: 'Device token removed successfully',
      data: {
        tokenCount: user.deviceTokens.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Device token delete API error:', error);
    return Response.json(
      {
        success: false,
        statusCode: 500,
        request: {
          method: 'DELETE',
          url: '/api/user/device-token'
        },
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}