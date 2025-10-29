import { NextResponse } from 'next/server';
import { withRoles } from '@/utils/roleMiddleware';
import TruckRequest from '@/models/TruckRequest';
import Notification from '@/models/Notification';

const getLoaderDashboard = async (request, { session, user }) => {
  try {
    const recentRequests = await TruckRequest.find({ requesterId: user._id })
      .populate('assignedTruck.driverId', 'name email')
      .populate('assignedTruck.assignedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    const statusCounts = await TruckRequest.aggregate([
      { $match: { requesterId: user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const priorityCounts = await TruckRequest.aggregate([
      { $match: { requesterId: user._id } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const totalRequests = await TruckRequest.countDocuments({ requesterId: user._id });
    const pendingRequests = await TruckRequest.countDocuments({
      requesterId: user._id,
      status: 'pending'
    });
    const completedRequests = await TruckRequest.countDocuments({
      requesterId: user._id,
      status: 'completed'
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

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyRequests = await TruckRequest.countDocuments({
      requesterId: user._id,
      createdAt: { $gte: thisMonth }
    });

    // Calculate average response time
    const completedWithTiming = await TruckRequest.find({
      requesterId: user._id,
      status: 'completed',
      'assignedTruck.assignedAt': { $exists: true }
    });

    let averageResponseTime = '0m';
    if (completedWithTiming.length > 0) {
      const totalTime = completedWithTiming.reduce((sum, request) => {
        const created = new Date(request.createdAt);
        const assigned = new Date(request.assignedTruck.assignedAt);
        return sum + (assigned - created);
      }, 0);
      const avgMinutes = Math.round(totalTime / (completedWithTiming.length * 60000));
      averageResponseTime = `${avgMinutes}m`;
    }

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const todayRequests = await TruckRequest.countDocuments({
      requesterId: user._id,
      createdAt: { $gte: today, $lte: todayEnd }
    });

    const todayCompleted = await TruckRequest.countDocuments({
      requesterId: user._id,
      status: 'completed',
      updatedAt: { $gte: today, $lte: todayEnd }
    });

    // Weekly trends
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyTrend = await TruckRequest.aggregate([
      {
        $match: {
          requesterId: user._id,
          createdAt: { $gte: weekAgo }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfWeek: '$createdAt' },
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Loader dashboard data retrieved successfully',
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
          pendingRequests,
          completedRequests,
          monthlyRequests,
          todayRequests,
          todayCompleted,
          unreadNotifications,
          averageResponseTime
        },
        statusBreakdown: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        priorityBreakdown: priorityCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentRequests,
        recentNotifications,
        weeklyTrend
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Loader dashboard error:', error);
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

export const GET = withRoles(['loader'])(getLoaderDashboard);