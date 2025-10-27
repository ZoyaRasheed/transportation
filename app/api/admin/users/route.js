import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function GET(req) {
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

    await connectDB();

    const users = await User.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        ip: req.ip || null,
        method: req.method || null,
        url: req.url || null,
      },
      message: 'Users retrieved successfully',
      data: {
        users: users.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          phone: user.phone,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        })),
        total: users.length
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
      message: 'Failed to retrieve users',
      data: null,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}