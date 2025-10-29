import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET(request) {
  try {
    await connectDB();

    return NextResponse.json({
      success: true,
      statusCode: 200,
      request: {
        method: request.method,
        url: request.url
      },
      message: 'Service is healthy',
      data: {
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: 'Connected',
        version: '1.0.0',
        uptime: process.uptime()
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
      message: 'Service is unhealthy',
      data: {
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        database: 'Disconnected',
        error: error.message
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}