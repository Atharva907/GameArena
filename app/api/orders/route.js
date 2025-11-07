import { connectDB } from '@/lib/databaseConnection';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Player from '@/models/Player';
import { NextResponse } from 'next/server';


// Get all orders for a player
export async function GET(request) {
  try {
    await connectDB();
    
    // Set response headers
    const headers = {
      'Content-Type': 'application/json',
    };

    const { searchParams } = new URL(request.url);
    const playerEmail = searchParams.get('playerEmail');
    const limit = parseInt(searchParams.get('limit')) || 20;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    // Find player by email
    const player = await Player.findOne({ email: playerEmail });
    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    const orders = await Order.find({ player: player._id })
      .populate('items.product')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ player: player._id });

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

// Create a new order
export async function POST(request) {
  try {
    await connectDB();
    
    // Set response headers
    const headers = {
      'Content-Type': 'application/json',
    };

    const { playerEmail, items, shippingAddress } = await request.json();

    if (!playerEmail || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: playerEmail, items' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Find player by email
    const player = await Player.findOne({ email: playerEmail });
    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    // Check if player has enough balance
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 404 }
        );
      }

      if (product.inStock < item.quantity) {
        return NextResponse.json(
          { error: `Not enough stock for product: ${product.name}` },
          { status: 400 }
        );
      }

      totalAmount += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }

    if (player.walletBalance < totalAmount) {
      return NextResponse.json(
        { error: 'Insufficient wallet balance' },
        { status: 400 }
      );
    }

    // Create order
    const order = new Order({
      player: player._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      status: 'confirmed',
      paymentStatus: 'completed'
    });

    await order.save();

    // Update player wallet balance
    await Player.findByIdAndUpdate(
      player._id,
      { 
        $inc: { walletBalance: -totalAmount },
        $push: {
          transactions: {
            type: 'purchase',
            amount: -totalAmount,
            description: `Order #${order._id}`,
            createdAt: new Date()
          }
        }
      }
    );

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { inStock: -item.quantity } }
      );
    }

    // Populate product details in response
    await order.populate('items.product');

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}
