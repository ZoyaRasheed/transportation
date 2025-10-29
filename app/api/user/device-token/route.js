import { NextResponse } from 'next/server';
import { withRoles } from '@/utils/roleMiddleware';

const saveDeviceToken = async (request, { session, user }) => {
  try {
    const { deviceToken } = await request.json();

    if (!deviceToken) {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'Device token is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    if (!user.deviceTokens.includes(deviceToken)) {
      user.deviceTokens.push(deviceToken);
      await user.save();
    }

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Device token saved successfully',
      data: {
        tokenCount: user.deviceTokens.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Device token API error:', error);
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

const removeDeviceToken = async (request, { session, user }) => {
  try {
    const { deviceToken } = await request.json();

    if (!deviceToken) {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'Device token is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    user.deviceTokens = user.deviceTokens.filter(token => token !== deviceToken);
    await user.save();

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Device token removed successfully',
      data: {
        tokenCount: user.deviceTokens.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Device token delete API error:', error);
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

export const POST = withRoles(['loader', 'switcher', 'dispatcher', 'supervisor', 'admin'])(saveDeviceToken);
export const DELETE = withRoles(['loader', 'switcher', 'dispatcher', 'supervisor', 'admin'])(removeDeviceToken);