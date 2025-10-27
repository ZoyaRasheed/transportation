import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({
        success: false,
        statusCode: 401,
        request: {
          ip: req.ip || null,
          method: req.method || null,
          url: req.url || null,
        },
        message: 'Authentication required',
        data: null,
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({
        success: false,
        statusCode: 404,
        request: {
          ip: req.ip || null,
          method: req.method || null,
          url: req.url || null,
        },
        message: 'User profile not found',
        data: null,
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        ip: req.ip || null,
        method: req.method || null,
        url: req.url || null,
      },
      message: 'Profile retrieved successfully',
      data: {
          id: user._id,
          name: user.name,
          email: user.email,
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
        ip: req.ip || null,
        method: req.method || null,
        url: req.url || null,
      },
      message: 'Failed to retrieve profile',
      data: null,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({
        success: false,
        statusCode: 401,
        request: {
          ip: req.ip || null,
          method: req.method || null,
          url: req.url || null,
        },
        message: 'Authentication required',
        data: null,
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    const { name, phone, preferences } = await req.json();

    await connectDB();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({
        success: false,
        statusCode: 404,
        request: {
          ip: req.ip || null,
          method: req.method || null,
          url: req.url || null,
        },
        message: 'User not found',
        data: null,
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        ip: req.ip || null,
        method: req.method || null,
        url: req.url || null,
      },
      message: 'Profile updated successfully',
      data: {
          id: user._id,
          name: user.name,
          email: user.email,
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
        ip: req.ip || null,
        method: req.method || null,
        url: req.url || null,
      },
      message: 'Failed to update profile',
      data: null,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}