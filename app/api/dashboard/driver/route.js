import { NextResponse } from 'next/server';
import { withRoles } from '@/utils/roleMiddleware';
import TruckRequest from '@/models/TruckRequest';
import DriverProfile from '@/models/DriverProfile';
import Truck from '@/models/Truck';
import Notification from '@/models/Notification';

const getDriverDashboard = async (request, { session, user }) => {
  try {
    // Get driver profile
    const driverProfile = await DriverProfile.findOne({ userId: user._id })
      .populate('currentTruckId', 'truckNumber plateNumber type capacity');

    if (!driverProfile) {
      return NextResponse.json({
        success: false,
        statusCode: 404,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'Driver profile not found. Please contact admin to create your profile.',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    // Get assigned truck requests
    const assignedRequests = await TruckRequest.find({
      'assignedTruck.driverId': driverProfile._id
    })
      .populate('requesterId', 'name email')
      .populate('assignedTruck.truckId', 'truckNumber plateNumber type')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get current active trip (in_progress)
    const currentTrip = await TruckRequest.findOne({
      'assignedTruck.driverId': driverProfile._id,
      status: 'in_progress'
    })
      .populate('requesterId', 'name email')
      .populate('assignedTruck.truckId', 'truckNumber plateNumber type capacity');

    // Get status counts
    const statusCounts = await TruckRequest.aggregate([
      { $match: { 'assignedTruck.driverId': driverProfile._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get total stats
    const totalTrips = await TruckRequest.countDocuments({
      'assignedTruck.driverId': driverProfile._id
    });

    const completedTrips = await TruckRequest.countDocuments({
      'assignedTruck.driverId': driverProfile._id,
      status: 'completed'
    });

    const pendingTrips = await TruckRequest.countDocuments({
      'assignedTruck.driverId': driverProfile._id,
      status: 'assigned'
    });

    const inProgressTrips = await TruckRequest.countDocuments({
      'assignedTruck.driverId': driverProfile._id,
      status: 'in_progress'
    });

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const todayTrips = await TruckRequest.countDocuments({
      'assignedTruck.driverId': driverProfile._id,
      'assignedTruck.assignedAt': { $gte: today, $lte: todayEnd }
    });

    const todayCompleted = await TruckRequest.countDocuments({
      'assignedTruck.driverId': driverProfile._id,
      status: 'completed',
      updatedAt: { $gte: today, $lte: todayEnd }
    });

    // Get this month's stats
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyTrips = await TruckRequest.countDocuments({
      'assignedTruck.driverId': driverProfile._id,
      'assignedTruck.assignedAt': { $gte: thisMonth }
    });

    // Get unread notifications
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

    // Weekly performance trend
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyTrend = await TruckRequest.aggregate([
      {
        $match: {
          'assignedTruck.driverId': driverProfile._id,
          'assignedTruck.assignedAt': { $gte: weekAgo }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfWeek: '$assignedTruck.assignedAt' },
            date: { $dateToString: { format: '%Y-%m-%d', date: '$assignedTruck.assignedAt' } }
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
      message: 'Driver dashboard data retrieved successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department
        },
        driverProfile: {
          id: driverProfile._id,
          licenseNumber: driverProfile.licenseNumber,
          licenseType: driverProfile.licenseType,
          licenseExpiry: driverProfile.licenseExpiry,
          phone: driverProfile.phone,
          status: driverProfile.status,
          currentTruck: driverProfile.currentTruckId,
          experience: driverProfile.experience,
          ratings: driverProfile.ratings
        },
        stats: {
          totalTrips,
          completedTrips,
          pendingTrips,
          inProgressTrips,
          todayTrips,
          todayCompleted,
          monthlyTrips,
          unreadNotifications
        },
        statusBreakdown: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        currentTrip,
        assignedRequests,
        recentNotifications,
        weeklyTrend
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Driver dashboard error:', error);
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

export const GET = withRoles(['driver'])(getDriverDashboard);
