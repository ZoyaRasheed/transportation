import { NextResponse } from 'next/server';
import { withRoles } from '@/utils/roleMiddleware';
import TruckRequest from '@/models/TruckRequest';
import Notification from '@/models/Notification';
import User from '@/models/User';

const getAdminDashboard = async (request, { session, user }) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalRequests = await TruckRequest.countDocuments();
    const totalNotifications = await Notification.countDocuments();

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const usersByDepartment = await User.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    const requestsByStatus = await TruckRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const requestsByPriority = await TruckRequest.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const requestTrends = await TruckRequest.aggregate([
      { $match: { createdAt: { $gte: last30Days } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    const completionRate = await TruckRequest.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    const averageCompletionTime = await TruckRequest.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          avgTime: {
            $avg: {
              $subtract: ['$updatedAt', '$createdAt']
            }
          }
        }
      }
    ]);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email role department isActive createdAt');

    const recentRequests = await TruckRequest.find()
      .populate('requesterId', 'name email role department')
      .populate('assignedTruck.driverId', 'name email')
      .sort({ createdAt: -1 })
      .limit(15);

    const systemAlerts = [];

    const inactiveUsers = await User.countDocuments({ isActive: false });
    if (inactiveUsers > 0) {
      systemAlerts.push({
        type: 'warning',
        message: `${inactiveUsers} inactive users in the system`,
        count: inactiveUsers
      });
    }

    const overdueRequests = await TruckRequest.countDocuments({
      status: { $in: ['pending', 'assigned'] },
      requiredTime: { $lt: new Date() }
    });
    if (overdueRequests > 0) {
      systemAlerts.push({
        type: 'error',
        message: `${overdueRequests} overdue truck requests`,
        count: overdueRequests
      });
    }

    const unreadNotifications = await Notification.countDocuments({
      recipientId: user._id,
      isRead: false
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStats = {
      newUsers: await User.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow }
      }),
      newRequests: await TruckRequest.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow }
      }),
      completedRequests: await TruckRequest.countDocuments({
        status: 'completed',
        updatedAt: { $gte: today, $lt: tomorrow }
      })
    };

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Admin dashboard data retrieved successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department
        },
        systemStats: {
          totalUsers,
          activeUsers,
          totalRequests,
          totalNotifications,
          unreadNotifications,
          completionRate: completionRate[0] ?
            Math.round((completionRate[0].completed / completionRate[0].total) * 100) : 0,
          avgCompletionTimeHours: averageCompletionTime[0] ?
            Math.round(averageCompletionTime[0].avgTime / (1000 * 60 * 60)) : 0
        },
        todayStats,
        breakdowns: {
          usersByRole: usersByRole.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          usersByDepartment: usersByDepartment.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          requestsByStatus: requestsByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          requestsByPriority: requestsByPriority.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        },
        trends: {
          requestTrends: requestTrends.map(item => ({
            date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
            count: item.count
          }))
        },
        recentUsers,
        recentRequests,
        systemAlerts
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Admin dashboard error:', error);
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

export const GET = withRoles(['admin'])(getAdminDashboard);