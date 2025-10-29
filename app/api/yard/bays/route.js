import { NextResponse } from 'next/server';
import { withRoles } from '@/utils/roleMiddleware';
import LoadingBay from '@/models/LoadingBay';

const getLoadingBays = async (request, { session, user }) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const isActive = searchParams.get('isActive');

    let query = {};
    if (status) query.status = status;
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const bays = await LoadingBay.find(query)
      .populate('assignedBy', 'name email role')
      .populate('currentTruck.driverId', 'name email phone')
      .sort({ bayNumber: 1 });

    const statusCounts = await LoadingBay.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Loading bays retrieved successfully',
      data: {
        bays,
        statusBreakdown: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        totalBays: bays.length
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Get loading bays error:', error);
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

const createLoadingBay = async (request, { session, user }) => {
  try {
    const { bayNumber, bayName, location, capacity } = await request.json();

    if (!bayNumber || !bayName || !location) {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'Bay number, name, and location are required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const existingBay = await LoadingBay.findOne({ bayNumber });
    if (existingBay) {
      return NextResponse.json({
        success: false,
        statusCode: 409,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'Bay number already exists',
        timestamp: new Date().toISOString()
      }, { status: 409 });
    }

    const bay = new LoadingBay({
      bayNumber,
      bayName,
      location,
      capacity: capacity || 1,
      assignedBy: user._id
    });

    await bay.save();

    const populatedBay = await LoadingBay.findById(bay._id)
      .populate('assignedBy', 'name email role');

    return NextResponse.json({
      success: true,
      statusCode: 201,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Loading bay created successfully',
      data: populatedBay,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    console.error('Create loading bay error:', error);
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

export const GET = withRoles(['switcher', 'dispatcher', 'supervisor', 'admin'])(getLoadingBays);
export const POST = withRoles(['supervisor', 'admin'])(createLoadingBay);