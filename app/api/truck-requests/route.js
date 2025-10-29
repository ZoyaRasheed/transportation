import { NextResponse } from 'next/server';
import { withRoles } from '@/utils/roleMiddleware';
import TruckRequest from '@/models/TruckRequest';
import Notification from '@/models/Notification';
import User from '@/models/User';

const createTruckRequest = async (request, { session, user }) => {
  try {
    const { loadId, loadDescription, priority, pickupLocation, deliveryLocation, estimatedWeight, requiredTime, notes } = await request.json();

    if (!loadId || !loadDescription || !pickupLocation || !deliveryLocation) {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'Missing required fields: loadId, loadDescription, pickupLocation, deliveryLocation',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const truckRequest = new TruckRequest({
      requesterId: user._id,
      loadId,
      loadDescription,
      priority: priority || 'normal',
      pickupLocation,
      deliveryLocation,
      estimatedWeight,
      requiredTime: requiredTime ? new Date(requiredTime) : null,
      notes
    });

    await truckRequest.save();

    const populatedRequest = await TruckRequest.findById(truckRequest._id)
      .populate('requesterId', 'name email role department');

    // Create notifications for dispatchers and supervisors
    try {
      const dispatchersAndSupervisors = await User.find({
        role: { $in: ['dispatcher', 'supervisor', 'admin'] },
        isActive: true
      });

      const priorityEmoji = {
        'low': '🟢',
        'normal': '🟡',
        'medium': '🟡',
        'high': '🔴',
        'urgent': '🚨'
      };

      const notificationPromises = dispatchersAndSupervisors.map(recipient => {
        const notification = new Notification({
          recipientId: recipient._id,
          senderId: user._id,
          type: 'truck_request',
          title: 'New Truck Request Created',
          message: `${priorityEmoji[priority] || '📦'} ${user.name} created a new ${priority} priority truck request from ${pickupLocation} to ${deliveryLocation}`,
          data: {
            truckRequestId: truckRequest._id,
            status: 'pending',
            priority: priority,
            actionUrl: `/dashboard/dispatcher/requests/${truckRequest._id}`
          }
        });
        return notification.save();
      });

      await Promise.all(notificationPromises);
      console.log(`Created ${notificationPromises.length} notifications for new truck request ${truckRequest._id}`);
    } catch (notificationError) {
      console.error('Failed to create notifications:', notificationError);
      // Don't fail the request creation if notifications fail
    }

    return NextResponse.json({
      success: true,
      statusCode: 201,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Truck request created successfully',
      data:  populatedRequest,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    console.error('Truck request creation error:', error);
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

const getTruckRequests = async (request, { session, user }) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    let query = {};

    if (user.role === 'loader') {
      query.requesterId = user._id;
    }

    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }

    const skip = (page - 1) * limit;

    const requests = await TruckRequest.find(query)
      .populate('requesterId', 'name email role department')
      .populate('assignedTruck.driverId', 'name email')
      .populate('assignedTruck.assignedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await TruckRequest.countDocuments(query);

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Truck requests retrieved successfully',
      data: {
        requests,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Truck requests retrieval error:', error);
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

export const POST = withRoles(['loader', 'admin'])(createTruckRequest);
export const GET = withRoles(['loader', 'dispatcher', 'admin', 'supervisor'])(getTruckRequests);