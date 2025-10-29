import { NextResponse } from 'next/server';
import { withRoles } from '@/utils/roleMiddleware';
import DriverProfile from '@/models/DriverProfile';
import User from '@/models/User';

const getDrivers = async (request, { session, user }) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const available = searchParams.get('available');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    let query = { isActive: true };

    if (status) {
      query.status = status;
    }
    if (available === 'true') {
      query.status = 'available';
    }

    const skip = (page - 1) * limit;

    const drivers = await DriverProfile.find(query)
      .populate('userId', 'name email phone image')
      .populate('currentTruckId', 'truckNumber plateNumber type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await DriverProfile.countDocuments(query);
    const availableCount = await DriverProfile.countDocuments({
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
      message: 'Drivers retrieved successfully',
      data: {
        drivers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: {
          total,
          available: availableCount,
          assigned: await DriverProfile.countDocuments({ status: 'assigned', isActive: true }),
          onTrip: await DriverProfile.countDocuments({ status: 'on_trip', isActive: true })
        }
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Drivers retrieval error:', error);
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

const createDriver = async (request, { session, user }) => {
  try {
    const {
      userId,
      licenseNumber,
      licenseExpiry,
      licenseType,
      phone,
      emergencyContact,
      address,
      experience
    } = await request.json();

    if (!userId || !licenseNumber || !licenseExpiry || !licenseType || !phone) {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'Missing required fields: userId, licenseNumber, licenseExpiry, licenseType, phone',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Check if user exists and is a driver
    const driverUser = await User.findById(userId);
    if (!driverUser || driverUser.role !== 'driver') {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'User must exist and have driver role',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Check if driver profile already exists
    const existingProfile = await DriverProfile.findOne({ userId });
    if (existingProfile) {
      return NextResponse.json({
        success: false,
        statusCode: 409,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'Driver profile already exists for this user',
        timestamp: new Date().toISOString()
      }, { status: 409 });
    }

    // Check if license number already exists
    const existingLicense = await DriverProfile.findOne({ licenseNumber });
    if (existingLicense) {
      return NextResponse.json({
        success: false,
        statusCode: 409,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'License number already exists',
        timestamp: new Date().toISOString()
      }, { status: 409 });
    }

    const driverProfile = new DriverProfile({
      userId,
      licenseNumber,
      licenseExpiry: new Date(licenseExpiry),
      licenseType,
      phone,
      emergencyContact,
      address,
      experience,
      status: 'available'
    });

    await driverProfile.save();

    const populatedProfile = await DriverProfile.findById(driverProfile._id)
      .populate('userId', 'name email image');

    return NextResponse.json({
      success: true,
      statusCode: 201,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Driver profile created successfully',
      data: populatedProfile,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    console.error('Driver profile creation error:', error);
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

export const GET = withRoles(['dispatcher', 'supervisor', 'admin'])(getDrivers);
export const POST = withRoles(['admin', 'supervisor'])(createDriver);