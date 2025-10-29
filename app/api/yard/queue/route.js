import { NextResponse } from 'next/server';
import { withRoles } from '@/utils/roleMiddleware';
import TruckRequest from '@/models/TruckRequest';
import YardMovement from '@/models/YardMovement';
import LoadingBay from '@/models/LoadingBay';

const getYardQueue = async (request, { session, user }) => {
  try {
    const queuedTrucks = await TruckRequest.find({
      status: 'assigned',
      $or: [
        { 'assignedTruck.truckId': { $exists: true } }
      ]
    })
      .populate('requesterId', 'name email role department')
      .populate('assignedTruck.driverId', 'name email phone')
      .populate('assignedTruck.assignedBy', 'name email')
      .sort({ priority: -1, createdAt: 1 });

    const inLoadingTrucks = await TruckRequest.find({
      status: 'in_progress'
    })
      .populate('requesterId', 'name email role department')
      .populate('assignedTruck.driverId', 'name email phone')
      .sort({ createdAt: 1 });

    const occupiedBays = await LoadingBay.find({ status: 'occupied' })
      .populate('assignedBy', 'name email role')
      .populate('currentTruck.driverId', 'name email phone');

    const availableBays = await LoadingBay.find({
      status: 'available',
      isActive: true
    }).sort({ bayNumber: 1 });

    const recentMovements = await YardMovement.find()
      .populate('truckRequestId', 'loadId priority')
      .populate('driverId', 'name email')
      .populate('switcherId', 'name email')
      .populate('loadingBayId', 'bayNumber bayName')
      .sort({ createdAt: -1 })
      .limit(10);

    const queueStats = {
      totalInQueue: queuedTrucks.length,
      totalInLoading: inLoadingTrucks.length,
      availableBays: availableBays.length,
      occupiedBays: occupiedBays.length,
      urgentRequests: queuedTrucks.filter(req => req.priority === 'urgent').length
    };

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Yard queue retrieved successfully',
      data: {
        queuedTrucks,
        inLoadingTrucks,
        occupiedBays,
        availableBays,
        recentMovements,
        queueStats
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Get yard queue error:', error);
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

const updateQueuePriority = async (request, { session, user }) => {
  try {
    const { truckRequestId, newPriority, position } = await request.json();

    if (!truckRequestId) {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'Truck request ID is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const truckRequest = await TruckRequest.findById(truckRequestId);
    if (!truckRequest) {
      return NextResponse.json({
        success: false,
        statusCode: 404,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'Truck request not found',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    if (newPriority) {
      const validPriorities = ['low', 'normal', 'high', 'urgent'];
      if (!validPriorities.includes(newPriority)) {
        return NextResponse.json({
          success: false,
          statusCode: 400,
          request: {
            method: request.method,
            url: request.url
          },
          message: `Invalid priority. Valid priorities: ${validPriorities.join(', ')}`,
          timestamp: new Date().toISOString()
        }, { status: 400 });
      }

      truckRequest.priority = newPriority;
      await truckRequest.save();
    }

    const movement = new YardMovement({
      truckRequestId,
      truckId: truckRequest.assignedTruck?.truckId || 'Unknown',
      driverId: truckRequest.assignedTruck?.driverId,
      movementType: 'queue',
      toLocation: `Queue Position ${position || 'Updated'}`,
      switcherId: user._id,
      notes: `Priority updated to ${newPriority || truckRequest.priority}`
    });

    await movement.save();

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Queue priority updated successfully',
      data: {
        truckRequest,
        movement
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Update queue priority error:', error);
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

export const GET = withRoles(['switcher', 'dispatcher', 'supervisor', 'admin'])(getYardQueue);
export const PUT = withRoles(['switcher', 'dispatcher', 'supervisor', 'admin'])(updateQueuePriority);