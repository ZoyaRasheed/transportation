import { NextResponse } from 'next/server';
import { withRoles } from '@/utils/roleMiddleware';
import TruckRequest from '@/models/TruckRequest';
import Notification from '@/models/Notification';
import User from '@/models/User';

const getDispatcherDashboard = async (request, { session, user }) => {
  try {
    const pendingRequests = await TruckRequest.find({ status: 'pending' })
      .populate('requesterId', 'name email role department')
      .sort({ createdAt: -1 })
      .limit(20);

    const inProgressRequests = await TruckRequest.find({ status: 'in_progress' })
      .populate('requesterId', 'name email role department')
      .populate('assignedTruck.driverId', 'name email')
      .populate('assignedTruck.assignedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(15);

    const urgentRequests = await TruckRequest.find({
      priority: 'urgent',
      status: { $in: ['pending', 'assigned'] }
    })
      .populate('requesterId', 'name email role department')
      .populate('assignedTruck.driverId', 'name email')
      .sort({ createdAt: -1 });

    const statusCounts = await TruckRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const priorityCounts = await TruckRequest.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const availableDrivers = await User.find({
      role: 'driver',
      isActive: true
    }).select('name email phone');

    const totalRequests = await TruckRequest.countDocuments();
    const assignedByMe = await TruckRequest.countDocuments({
      'assignedTruck.assignedBy': user._id
    });

    const unreadNotifications = await Notification.countDocuments({
      recipientId: user._id,
      isRead: false
    });

    const recentNotifications = await Notification.find({
      recipientId: user._id
    })
      .populate('senderId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(5);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRequests = await TruckRequest.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const completedToday = await TruckRequest.countDocuments({
      status: 'completed',
      updatedAt: { $gte: today, $lt: tomorrow }
    });

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Dispatcher dashboard data retrieved successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department
        },
        stats: {
          totalRequests,
          assignedByMe,
          todayRequests,
          completedToday,
          unreadNotifications,
          availableDriversCount: availableDrivers.length
        },
        statusBreakdown: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        priorityBreakdown: priorityCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        pendingRequests,
        inProgressRequests,
        urgentRequests,
        availableDrivers,
        recentNotifications
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Dispatcher dashboard error:', error);
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

export const GET = withRoles(['dispatcher', 'supervisor', 'admin'])(getDispatcherDashboard);