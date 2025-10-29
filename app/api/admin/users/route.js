import { NextResponse } from 'next/server';
import { withRoles } from '@/utils/roleMiddleware';
import User from '@/models/User';

const getUsers = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const role = searchParams.get('role');
    const department = searchParams.get('department');
    const isActive = searchParams.get('isActive');

    let query = {};

    if (role) {
      query.role = role;
    }
    if (department) {
      query.department = department;
    }
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        method: request.method,
        url: request.url
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
    return NextResponse.json({
      success: false,
      statusCode: 500,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Failed to retrieve users',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
};

export const GET = withRoles(['admin'])(getUsers);