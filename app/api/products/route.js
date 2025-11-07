import { connectToDatabase } from '@/lib/databaseConnection';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';


// Get all products
export async function GET(request) {
  try {
    console.log('Starting GET /api/products');
    
    // Check environment variables
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not defined in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: Database connection string missing' },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    
    console.log('Connecting to database...');
    await connectToDatabase();
    
    // 确保连接已建立
    if (mongoose.connection.readyState !== 1) {
      console.error("Database not properly connected, state:", mongoose.connection.readyState);
      throw new Error("Database connection not ready");
    }
    
    console.log('Database connected successfully');
    
    // Set response headers
    const headers = {
      'Content-Type': 'application/json',
    };

    const { searchParams } = new URL(request.url);
    console.log('Query parameters:', Object.fromEntries(searchParams.entries()));
    const featured = searchParams.get('featured');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit')) || 20;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (featured === 'true') {
      query.isFeatured = true;
    }
    if (category) {
      query.category = category;
    }

    console.log('Query:', query);
    console.log('Fetching products from database...');
    
    const products = await Product.find(query)
      .populate('category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    console.log(`Found ${products.length} products`);
    
    console.log('Counting total products...');
    const total = await Product.countDocuments(query);
    console.log(`Total products: ${total}`);

    console.log('Preparing response...');
    const response = {
      products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    };
    
    console.log('Sending response...');
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching products:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // Log additional error details if available
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        details: error.message || 'Unknown error occurred'
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}

// Create a new product (admin only)
export async function POST(request) {
  try {
    await connectToDatabase();
    
    // Set response headers
    const headers = {
      'Content-Type': 'application/json',
    };

    const productData = await request.json();

    // Validate required fields
    if (!productData.name || !productData.price || !productData.category || !productData.image) {
      return NextResponse.json(
        { error: 'Missing required fields: name, price, category, image' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const product = new Product(productData);
    await product.save();

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}
