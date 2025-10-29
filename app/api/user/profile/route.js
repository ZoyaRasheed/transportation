import { NextResponse } from 'next/server';
import { withRoles } from '@/utils/roleMiddleware';

const getProfile = async (request, { session, user }) => {
  try {
    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Profile retrieved successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        department: user.department,
        phone: user.phone,
        preferences: user.preferences,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      statusCode: 500,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Failed to retrieve profile',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
};

const updateProfile = async (request, { session, user }) => {
  try {
    const { name, phone, preferences } = await request.json();

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        department: user.department,
        phone: user.phone,
        preferences: user.preferences
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      statusCode: 500,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Failed to update profile',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
};

export const GET = withRoles(['loader', 'switcher', 'dispatcher', 'supervisor', 'admin'])(getProfile);
export const PUT = withRoles(['loader', 'switcher', 'dispatcher', 'supervisor', 'admin'])(updateProfile);