import { NextResponse } from 'next/server';
import { withRoles } from '@/utils/roleMiddleware';
import TruckRequest from '@/models/TruckRequest';
import Notification from '@/models/Notification';

const updateTruckRequestStatus = async (request, { session, user }, params) => {
  try {
    const { id } = params;
    const { status, notes } = await request.json();

    if (!status) {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'Status is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const validStatuses = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        request: {
          method: request.method,
          url: request.url
        },
        message: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`,
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

    if (user.role === 'loader' && truckRequest.requesterId._id.toString() !== user._id.toString()) {
      return NextResponse.json({
        success: false,
        statusCode: 403,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'Access denied. You can only update your own requests',
        timestamp: new Date().toISOString()
      }, { status: 403 });
    }

    const oldStatus = truckRequest.status;
    truckRequest.status = status;
    if (notes) {
      truckRequest.notes = notes;
    }

    await truckRequest.save();

    const notification = new Notification({
      recipientId: truckRequest.requesterId._id,
      senderId: user._id,
      type: 'status_update',
      title: 'Truck Request Status Updated',
      message: `Your truck request #${truckRequest.loadId} status changed from ${oldStatus} to ${status}`,
      data: {
        truckRequestId: truckRequest._id,
        status: status,
        priority: truckRequest.priority,
        actionUrl: `/dashboard/requests/${truckRequest._id}`
      }
    });

    await notification.save();

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
      message: 'Truck request status updated successfully',
      data: {
        request: updatedRequest,
        oldStatus,
        newStatus: status
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Update truck request status error:', error);
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
  return withRoles(['loader', 'dispatcher', 'supervisor', 'admin'])(async (req, context) => {
    return updateTruckRequestStatus(req, context, params);
  })(request);
}