import { connectDB } from '@/lib/databaseConnection';
import mongoose from 'mongoose';
// Import the existing Order model to avoid duplication
let Order;

try {
  // Try to get the existing model
  Order = mongoose.model('Order');
} catch {
  // If the model doesn't exist, import it
  Order = require('@/models/Order').default;
}
import { NextResponse } from 'next/server';

// Get a single order by ID
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const order = await Order.findById(id)
      .populate('items.product')
      .populate('player', 'name email');

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// Update order status
export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('items.product').populate('player', 'name email');

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// Delete an order
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
