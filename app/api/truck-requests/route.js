import { NextResponse } from 'next/server';
import { withRoles } from '@/utils/roleMiddleware';
import TruckRequest from '@/models/TruckRequest';

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