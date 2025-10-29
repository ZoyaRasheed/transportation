import { NextResponse } from 'next/server';
import { withRoles } from '@/utils/roleMiddleware';
import TruckRequest from '@/models/TruckRequest';
import YardMovement from '@/models/YardMovement';
import LoadingBay from '@/models/LoadingBay';
import Notification from '@/models/Notification';

const getSwitcherDashboard = async (request, { session, user }) => {
  try {
    const queuedTrucks = await TruckRequest.find({
      status: 'assigned'
    })
      .populate('requesterId', 'name email role department')
      .populate('assignedTruck.driverId', 'name email phone')
      .sort({ priority: -1, createdAt: 1 })
      .limit(15);

    const inLoadingTrucks = await TruckRequest.find({
      status: 'in_progress'
    })
      .populate('requesterId', 'name email role department')
      .populate('assignedTruck.driverId', 'name email phone')
      .sort({ createdAt: 1 });

    const loadingBays = await LoadingBay.find({ isActive: true })
      .populate('assignedBy', 'name email role')
      .populate('currentTruck.driverId', 'name email phone')
      .sort({ bayNumber: 1 });

    const myMovements = await YardMovement.find({ switcherId: user._id })
      .populate('truckRequestId', 'loadId priority')
      .populate('driverId', 'name email')
      .populate('loadingBayId', 'bayNumber bayName')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentMovements = await YardMovement.find()
      .populate('truckRequestId', 'loadId priority')
      .populate('driverId', 'name email')
      .populate('switcherId', 'name email')
      .populate('loadingBayId', 'bayNumber bayName')
      .sort({ createdAt: -1 })
      .limit(15);

    const bayStatusCounts = await LoadingBay.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const movementTypeCounts = await YardMovement.aggregate([
      { $match: { switcherId: user._id } },
      { $group: { _id: '$movementType', count: { $sum: 1 } } }
    ]);

    const priorityCounts = await TruckRequest.aggregate([
      { $match: { status: { $in: ['assigned', 'in_progress'] } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

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

    const todayStats = {
      movementsToday: await YardMovement.countDocuments({
        switcherId: user._id,
        createdAt: { $gte: today, $lt: tomorrow }
      }),
      trucksProcessed: await YardMovement.countDocuments({
        switcherId: user._id,
        movementType: 'departure',
        createdAt: { $gte: today, $lt: tomorrow }
      }),
      assignmentsToday: await YardMovement.countDocuments({
        switcherId: user._id,
        movementType: 'bay_assigned',
        createdAt: { $gte: today, $lt: tomorrow }
      })
    };

    const yardStats = {
      totalInQueue: queuedTrucks.length,
      totalInLoading: inLoadingTrucks.length,
      availableBays: loadingBays.filter(bay => bay.status === 'available').length,
      occupiedBays: loadingBays.filter(bay => bay.status === 'occupied').length,
      urgentInQueue: queuedTrucks.filter(req => req.priority === 'urgent').length,
      unreadNotifications
    };

    const currentShiftMovements = await YardMovement.countDocuments({
      switcherId: user._id,
      createdAt: { $gte: today }
    });

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Switcher dashboard data retrieved successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department
        },
        yardStats,
        todayStats,
        currentShiftMovements,
        breakdowns: {
          bayStatus: bayStatusCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          movementTypes: movementTypeCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          queuePriorities: priorityCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        },
        queuedTrucks,
        inLoadingTrucks,
        loadingBays,
        myMovements,
        recentMovements,
        recentNotifications
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Switcher dashboard error:', error);
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

export const GET = withRoles(['switcher'])(getSwitcherDashboard);