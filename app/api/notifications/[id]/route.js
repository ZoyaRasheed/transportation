import { NextResponse } from 'next/server';
import { withRoles } from '@/utils/roleMiddleware';
import Notification from '@/models/Notification';

const markAsRead = async (request, { session, user }, params) => {
  try {
    const { id } = params;

    const notification = await Notification.findOne({
      _id: id,
      recipientId: user._id
    });

    if (!notification) {
      return NextResponse.json({
        success: false,
        statusCode: 404,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'Notification not found',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Notification marked as read',
      data: notification,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Mark notification as read error:', error);
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

const deleteNotification = async (request, { session, user }, params) => {
  try {
    const { id } = params;

    const notification = await Notification.findOne({
      _id: id,
      recipientId: user._id
    });

    if (!notification) {
      return NextResponse.json({
        success: false,
        statusCode: 404,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'Notification not found',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    await Notification.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Notification deleted successfully',
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Delete notification error:', error);
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

export async function PUT(request, { params }) {
  return withRoles(['loader', 'switcher', 'dispatcher', 'supervisor', 'admin'])(async (req, context) => {
    return markAsRead(req, context, params);
  })(request);
}

export async function DELETE(request, { params }) {
  return withRoles(['loader', 'switcher', 'dispatcher', 'supervisor', 'admin'])(async (req, context) => {
    return deleteNotification(req, context, params);
  })(request);
}