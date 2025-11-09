import { connectToDatabase } from '@/lib/db';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

// Get a single product by ID
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    // Set response headers
    const headers = {
      'Content-Type': 'application/json',
    };

    // Await params to get the ID (required in Next.js 15)
    const { id } = await params;
    const product = await Product.findById(id).populate('category');

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: JSON.parse(JSON.stringify(product))
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// Update a product (admin only)
export async function PUT(request, { params }) {
  try {
    await connectToDatabase();

    const updateData = await request.json();
    
    // Await params to get the ID (required in Next.js 15)
    const { id } = await params;

    const product = await Product.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: JSON.parse(JSON.stringify(product))
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// Delete a product (admin only)
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    
    // Await params to get the ID (required in Next.js 15)
    const { id } = await params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
