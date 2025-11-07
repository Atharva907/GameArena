import { connectDB } from '@/lib/databaseConnection';
import mongoose from 'mongoose';
// Import existing Order model to avoid duplication
let Order;

try {
  // Try to get the existing model
  Order = mongoose.model('Order');
} catch {
  // If model doesn't exist, import it
  Order = require('@/models/Order').default;
}
import { NextResponse } from 'next/server';

// Get all orders (admin only)
export async function GET(request) {
  try {
    await connectDB();

    // Set response headers
    const headers = {
      'Content-Type': 'application/json',
    };

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit')) || 20;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    // If status is provided, filter by status
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.product')
      .populate('player', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}
