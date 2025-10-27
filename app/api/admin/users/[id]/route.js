import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import connectDB from '../../../../../lib/mongodb';
import User from '../../../../../models/User';

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        statusCode: 403,
        request: {
          ip: req.ip || null,
          method: req.method || null,
          url: req.url || null,
        },
        message: 'Admin access required',
        data: null,
        timestamp: new Date().toISOString()
      }, { status: 403 });
    }

    const { id } = params;
    const { role, department, isActive } = await req.json();

    await connectDB();

    const user = await User.findById(id);

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

    if (role && ['loader', 'switcher', 'dispatcher', 'supervisor', 'admin'].includes(role)) {
      user.role = role;
    }

    if (department && ['loading', 'transportation', 'management', 'admin'].includes(department)) {
      user.department = department;
    }

    if (typeof isActive === 'boolean') {
      user.isActive = isActive;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        ip: req.ip || null,
        method: req.method || null,
        url: req.url || null,
      },
      message: 'User updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        isActive: user.isActive
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
      message: 'Failed to update user',
      data: null,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}