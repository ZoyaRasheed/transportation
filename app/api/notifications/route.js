import { NextResponse } from 'next/server';
import { withRoles } from '@/utils/roleMiddleware';
import Notification from '@/models/Notification';

const getNotifications = async (request, { session, user }) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const isRead = searchParams.get('isRead');
    const type = searchParams.get('type');

    let query = { recipientId: user._id };

    if (isRead !== null && isRead !== undefined) {
      query.isRead = isRead === 'true';
    }
    if (type) {
      query.type = type;
    }

    const skip = (page - 1) * limit;

    const notifications = await Notification.find(query)
      .populate('senderId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipientId: user._id,
      isRead: false
    });

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Notifications retrieved successfully',
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Notifications retrieval error:', error);
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

const createNotification = async (request, { session, user }) => {
  try {
    const { recipientId, type, title, message, data } = await request.json();

    if (!recipientId || !type || !title || !message) {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'Missing required fields: recipientId, type, title, message',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const notification = new Notification({
      recipientId,
      senderId: user._id,
      type,
      title,
      message,
      data
    });

    await notification.save();

    const populatedNotification = await Notification.findById(notification._id)
      .populate('senderId', 'name email role')
      .populate('recipientId', 'name email role');

    return NextResponse.json({
      success: true,
      statusCode: 201,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Notification created successfully',
      data: populatedNotification,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    console.error('Notification creation error:', error);
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

export const GET = withRoles(['loader', 'switcher', 'dispatcher', 'supervisor', 'admin'])(getNotifications);
export const POST = withRoles(['dispatcher', 'supervisor', 'admin'])(createNotification);