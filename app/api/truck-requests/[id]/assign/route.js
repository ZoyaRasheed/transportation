import { NextResponse } from 'next/server';
import { withRoles } from '@/utils/roleMiddleware';
import TruckRequest from '@/models/TruckRequest';
import Truck from '@/models/Truck';
import DriverProfile from '@/models/DriverProfile';
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

    // Find and validate truck
    const truck = await Truck.findById(truckId);
    if (!truck || truck.status !== 'available') {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'Truck is not available for assignment',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Find and validate driver
    const driver = await DriverProfile.findById(driverId).populate('userId');
    if (!driver || driver.status !== 'available') {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'Driver is not available for assignment',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Update truck request
    truckRequest.assignedTruck = {
      truckId: truck._id,
      driverId: driver._id,
      assignedAt: new Date(),
      assignedBy: user._id
    };
    truckRequest.status = 'assigned';
    truckRequest.timeline = {
      ...truckRequest.timeline,
      assignedAt: new Date()
    };
    if (notes) {
      truckRequest.notes = notes;
    }
    await truckRequest.save();

    // Update truck status
    truck.status = 'assigned';
    truck.assignedDriverId = driver.userId._id;
    truck.currentRequestId = truckRequest._id;
    await truck.save();

    // Update driver status
    driver.status = 'assigned';
    driver.currentTruckId = truck._id;
    await driver.save();

    const loaderNotification = new Notification({
      recipientId: truckRequest.requesterId._id,
      senderId: user._id,
      type: 'status_update',
      title: 'Request Assigned',
      message: `✅ Your transportation request #${truckRequest._id.toString().slice(-6)} has been assigned to truck ${truck.truckNumber} with driver ${driver.userId.name}`,
      data: {
        truckRequestId: truckRequest._id,
        truckId: truck._id,
        driverId: driver._id,
        status: 'assigned',
        actionUrl: `/dashboard/loader/requests/${truckRequest._id}`
      }
    });

    const driverNotification = new Notification({
      recipientId: driver.userId._id,
      senderId: user._id,
      type: 'assignment',
      title: 'New Assignment Received',
      message: `🚚 You have been assigned to truck ${truck.truckNumber} for request #${truckRequest._id.toString().slice(-6)}. Route: ${truckRequest.pickupLocation} → ${truckRequest.deliveryLocation}`,
      data: {
        truckRequestId: truckRequest._id,
        truckId: truck._id,
        status: 'assigned',
        priority: truckRequest.priority,
        actionUrl: `/dashboard/driver/assignments/${truckRequest._id}`
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
          truck: truck,
          driver: driver,
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