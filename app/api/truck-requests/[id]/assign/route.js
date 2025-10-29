import { NextResponse } from 'next/server';
import { withRoles } from '@/utils/roleMiddleware';
import TruckRequest from '@/models/TruckRequest';
import Notification from '@/models/Notification';
import User from '@/models/User';

const assignTruckRequest = async (request, { session, user }, params) => {
  try {
    const { id } = params;
    const { truckId, driverId, notes } = await request.json();

    if (!truckId || !driverId) {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'Truck ID and Driver ID are required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const truckRequest = await TruckRequest.findById(id)
      .populate('requesterId', 'name email role department');

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

    if (truckRequest.status !== 'pending') {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'Can only assign trucks to pending requests',
        timestamp: new Date().toISOString()
      }, { status: 400 });
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

    truckRequest.assignedTruck = {
      truckId,
      driverId,
      assignedAt: new Date(),
      assignedBy: user._id
    };
    truckRequest.status = 'assigned';
    if (notes) {
      truckRequest.notes = notes;
    }

    await truckRequest.save();

    const loaderNotification = new Notification({
      recipientId: truckRequest.requesterId._id,
      senderId: user._id,
      type: 'assignment',
      title: 'Truck Assigned to Your Request',
      message: `Truck ${truckId} with driver ${driver.name} has been assigned to your request #${truckRequest.loadId}`,
      data: {
        truckRequestId: truckRequest._id,
        status: 'assigned',
        priority: truckRequest.priority,
        actionUrl: `/dashboard/requests/${truckRequest._id}`
      }
    });

    const driverNotification = new Notification({
      recipientId: driverId,
      senderId: user._id,
      type: 'assignment',
      title: 'New Truck Assignment',
      message: `You have been assigned to handle load #${truckRequest.loadId} from ${truckRequest.pickupLocation} to ${truckRequest.deliveryLocation}`,
      data: {
        truckRequestId: truckRequest._id,
        status: 'assigned',
        priority: truckRequest.priority,
        actionUrl: `/dashboard/assignments/${truckRequest._id}`
      }
    });

    await Promise.all([
      loaderNotification.save(),
      driverNotification.save()
    ]);

    const updatedRequest = await TruckRequest.findById(id)
      .populate('requesterId', 'name email role department')
      .populate('assignedTruck.driverId', 'name email')
      .populate('assignedTruck.assignedBy', 'name email');

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Truck assigned successfully',
      data: {
        request: updatedRequest,
        assignment: {
          truckId,
          driverName: driver.name,
          assignedAt: truckRequest.assignedTruck.assignedAt,
          assignedBy: user.name
        }
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Assign truck request error:', error);
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
  return withRoles(['dispatcher', 'supervisor', 'admin'])(async (req, context) => {
    return assignTruckRequest(req, context, params);
  })(request);
}