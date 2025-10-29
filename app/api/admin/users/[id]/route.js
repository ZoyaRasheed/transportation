import { NextResponse } from 'next/server';
import { withRoles } from '@/utils/roleMiddleware';
import User from '@/models/User';

const updateUser = async (request, { session, user }, params) => {
  try {
    const { id } = params;
    const { role, department, isActive } = await request.json();

    const targetUser = await User.findById(id);

    if (!targetUser) {
      return NextResponse.json({
        success: false,
        statusCode: 404,
        request: {
          method: request.method,
          url: request.url
        },
        message: 'User not found',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    if (role && ['loader', 'switcher', 'dispatcher', 'supervisor', 'admin'].includes(role)) {
      targetUser.role = role;
    }

    if (department && ['loading', 'transportation', 'management', 'admin'].includes(department)) {
      targetUser.department = department;
    }

    if (typeof isActive === 'boolean') {
      targetUser.isActive = isActive;
    }

    await targetUser.save();

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'User updated successfully',
      data: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        department: targetUser.department,
        isActive: targetUser.isActive
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
      message: 'Failed to update user',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
};

export async function PUT(request, { params }) {
  return withRoles(['admin'])(async (req, context) => {
    return updateUser(req, context, params);
  })(request);
}