import { NextResponse } from 'next/server';
import { withRoles } from '@/utils/roleMiddleware';
import LoadingBay from '@/models/LoadingBay';
import TruckRequest from '@/models/TruckRequest';
import YardMovement from '@/models/YardMovement';
import Notification from '@/models/Notification';
import User from '@/models/User';

const assignTruckToBay = async (request, { session, user }, params) => {
  try {
    const { id: bayId } = params;
    const { truckRequestId, truckId, driverId, estimatedDeparture, notes } = await request.json();

    if (!truckRequestId || !truckId || !driverId) {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'Truck request ID, truck ID, and driver ID are required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const bay = await LoadingBay.findById(bayId);
    if (!bay) {
      return NextResponse.json({
        success: false,
        statusCode: 404,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'Loading bay not found',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    if (bay.status === 'occupied') {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'Loading bay is already occupied',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const truckRequest = await TruckRequest.findById(truckRequestId)
      .populate('requesterId', 'name email');
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

    const driver = await User.findById(driverId);
    if (!driver) {
      return NextResponse.json({
        success: false,
        statusCode: 404,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'Driver not found',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    bay.status = 'occupied';
    bay.currentTruck = {
      truckId,
      driverId,
      assignedAt: new Date(),
      estimatedDeparture: estimatedDeparture ? new Date(estimatedDeparture) : null
    };
    bay.assignedBy = user._id;

    await bay.save();

    const movement = new YardMovement({
      truckRequestId,
      truckId,
      driverId,
      movementType: 'bay_assigned',
      toLocation: `Bay ${bay.bayNumber}`,
      loadingBayId: bayId,
      switcherId: user._id,
      notes,
      estimatedTime: estimatedDeparture ? new Date(estimatedDeparture) : null
    });

    await movement.save();

    const loaderNotification = new Notification({
      recipientId: truckRequest.requesterId._id,
      senderId: user._id,
      type: 'assignment',
      title: 'Truck Assigned to Loading Bay',
      message: `Your truck request #${truckRequest.loadId} has been assigned to ${bay.bayName} (Bay ${bay.bayNumber})`,
      data: {
        truckRequestId,
        bayId,
        bayNumber: bay.bayNumber,
        actionUrl: `/dashboard/requests/${truckRequestId}`
      }
    });

    const driverNotification = new Notification({
      recipientId: driverId,
      senderId: user._id,
      type: 'assignment',
      title: 'Loading Bay Assignment',
      message: `You have been assigned to ${bay.bayName} (Bay ${bay.bayNumber}) for load #${truckRequest.loadId}`,
      data: {
        truckRequestId,
        bayId,
        bayNumber: bay.bayNumber,
        actionUrl: `/dashboard/yard/${bayId}`
      }
    });

    await Promise.all([
      loaderNotification.save(),
      driverNotification.save()
    ]);

    const updatedBay = await LoadingBay.findById(bayId)
      .populate('assignedBy', 'name email role')
      .populate('currentTruck.driverId', 'name email phone');

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Truck assigned to loading bay successfully',
      data: {
        bay: updatedBay,
        movement,
        assignment: {
          truckId,
          driverName: driver.name,
          bayName: bay.bayName,
          assignedAt: bay.currentTruck.assignedAt,
          switcherName: user.name
        }
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Assign truck to bay error:', error);
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
  return withRoles(['switcher', 'dispatcher', 'supervisor', 'admin'])(async (req, context) => {
    return assignTruckToBay(req, context, params);
  })(request);
}