import { NextResponse } from 'next/server';
import { withRoles } from '@/utils/roleMiddleware';
import YardMovement from '@/models/YardMovement';
import TruckRequest from '@/models/TruckRequest';
import LoadingBay from '@/models/LoadingBay';
import Notification from '@/models/Notification';

const getYardMovements = async (request, { session, user }) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const truckId = searchParams.get('truckId');
    const movementType = searchParams.get('movementType');
    const date = searchParams.get('date');

    let query = {};

    if (user.role === 'switcher') {
      query.switcherId = user._id;
    }

    if (truckId) query.truckId = truckId;
    if (movementType) query.movementType = movementType;

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    const skip = (page - 1) * limit;

    const movements = await YardMovement.find(query)
      .populate('truckRequestId', 'loadId priority pickupLocation deliveryLocation')
      .populate('driverId', 'name email phone')
      .populate('switcherId', 'name email role')
      .populate('loadingBayId', 'bayNumber bayName location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await YardMovement.countDocuments(query);

    const movementTypeCounts = await YardMovement.aggregate([
      ...(user.role === 'switcher' ? [{ $match: { switcherId: user._id } }] : []),
      { $group: { _id: '$movementType', count: { $sum: 1 } } }
    ]);

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Yard movements retrieved successfully',
      data: {
        movements,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        movementTypeBreakdown: movementTypeCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Get yard movements error:', error);
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

const createYardMovement = async (request, { session, user }) => {
  try {
    const { truckRequestId, truckId, driverId, movementType, fromLocation, toLocation, loadingBayId, notes, estimatedTime } = await request.json();

    if (!truckRequestId || !truckId || !driverId || !movementType || !toLocation) {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'Truck request ID, truck ID, driver ID, movement type, and to location are required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const validMovementTypes = ['entry', 'queue', 'bay_assigned', 'loading', 'departure'];
    if (!validMovementTypes.includes(movementType)) {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        request: {
          method: request.method,
          url: request.url
        },
        message: `Invalid movement type. Valid types: ${validMovementTypes.join(', ')}`,
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

    const movement = new YardMovement({
      truckRequestId,
      truckId,
      driverId,
      movementType,
      fromLocation,
      toLocation,
      loadingBayId,
      switcherId: user._id,
      notes,
      estimatedTime: estimatedTime ? new Date(estimatedTime) : null
    });

    await movement.save();

    if (movementType === 'departure') {
      if (loadingBayId) {
        await LoadingBay.findByIdAndUpdate(loadingBayId, {
          status: 'available',
          $unset: { currentTruck: 1 }
        });
      }

      await TruckRequest.findByIdAndUpdate(truckRequestId, {
        status: 'completed'
      });
    }

    const notification = new Notification({
      recipientId: truckRequest.requesterId._id,
      senderId: user._id,
      type: 'status_update',
      title: 'Truck Movement Update',
      message: `Your truck #${truckId} has moved to ${toLocation} (${movementType.replace('_', ' ')})`,
      data: {
        truckRequestId,
        truckId,
        movementType,
        location: toLocation,
        actionUrl: `/dashboard/requests/${truckRequestId}`
      }
    });

    await notification.save();

    const populatedMovement = await YardMovement.findById(movement._id)
      .populate('truckRequestId', 'loadId priority pickupLocation deliveryLocation')
      .populate('driverId', 'name email phone')
      .populate('switcherId', 'name email role')
      .populate('loadingBayId', 'bayNumber bayName location');

    return NextResponse.json({
      success: true,
      statusCode: 201,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Yard movement recorded successfully',
      data: populatedMovement,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    console.error('Create yard movement error:', error);
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

export const GET = withRoles(['switcher', 'dispatcher', 'supervisor', 'admin'])(getYardMovements);
export const POST = withRoles(['switcher', 'dispatcher', 'supervisor', 'admin'])(createYardMovement);