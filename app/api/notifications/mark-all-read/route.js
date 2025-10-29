import { NextResponse } from 'next/server';
import { withRoles } from '@/utils/roleMiddleware';
import Notification from '@/models/Notification';

const markAllAsRead = async (request, { session, user }) => {
  try {
    const result = await Notification.updateMany(
      {
        recipientId: user._id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'All notifications marked as read',
      data: {
        modifiedCount: result.modifiedCount
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Mark all notifications as read error:', error);
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

export const PUT = withRoles(['loader', 'switcher', 'dispatcher', 'supervisor', 'admin'])(markAllAsRead);