import { NextResponse } from 'next/server';
import { withRoles } from '@/utils/roleMiddleware';
import Truck from '@/models/Truck';
import DriverProfile from '@/models/DriverProfile';

const getTrucks = async (request, { session, user }) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const available = searchParams.get('available');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    let query = { isActive: true };

    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }
    if (available === 'true') {
      query.status = 'available';
      query.assignedDriverId = { $exists: false };
    }

    const skip = (page - 1) * limit;

    const trucks = await Truck.find(query)
      .populate('assignedDriverId', 'name email phone')
      .populate('currentRequestId', 'loadId loadDescription status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Truck.countDocuments(query);
    const availableCount = await Truck.countDocuments({
      status: 'available',
      isActive: true
    });

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Trucks retrieved successfully',
      data: {
        trucks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: {
          total,
          available: availableCount,
          assigned: await Truck.countDocuments({ status: 'assigned', isActive: true }),
          maintenance: await Truck.countDocuments({ status: 'maintenance', isActive: true })
        }
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Trucks retrieval error:', error);
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

const createTruck = async (request, { session, user }) => {
  try {
    const {
      truckNumber,
      plateNumber,
      capacity,
      type,
      currentLocation,
      specifications
    } = await request.json();

    if (!truckNumber || !plateNumber || !capacity || !type) {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'Missing required fields: truckNumber, plateNumber, capacity, type',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Check if truck number or plate number already exists
    const existingTruck = await Truck.findOne({
      $or: [
        { truckNumber },
        { plateNumber }
      ]
    });

    if (existingTruck) {
      return NextResponse.json({
        success: false,
        statusCode: 409,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'Truck number or plate number already exists',
        timestamp: new Date().toISOString()
      }, { status: 409 });
    }

    const truck = new Truck({
      truckNumber,
      plateNumber: plateNumber.toUpperCase(),
      capacity,
      type,
      currentLocation,
      specifications,
      status: 'available'
    });

    await truck.save();

    return NextResponse.json({
      success: true,
      statusCode: 201,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Truck created successfully',
      data: truck,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    console.error('Truck creation error:', error);
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

export const GET = withRoles(['dispatcher', 'supervisor', 'admin', 'switcher'])(getTrucks);
export const POST = withRoles(['admin', 'supervisor'])(createTruck);