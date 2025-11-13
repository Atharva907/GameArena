import { connectDB } from '@/lib/databaseConnection';
import Category from '@/models/Category';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await connectDB();

    const categories = await Category.find({}).sort({ name: 1 });

    // Count products for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const productCount = await category.countProducts();
        return {
          ...category.toObject(),
          productCount
        };
      })
    );

    return NextResponse.json({
      success: true,
      categories: categoriesWithCounts
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  let retries = 3;
  let lastError;

  while (retries > 0) {
    try {
      await connectDB();

      const body = await request.json();
      const { name, description, isFeatured } = body;

      // Validate required fields
      if (!name) {
        return NextResponse.json(
          { success: false, message: 'Category name is required' },
          { status: 400 }
        );
      }

      // Check description length
      if (description && description.length > 200) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Description cannot exceed 200 characters',
            field: 'description',
            currentLength: description.length,
            maxLength: 200
          },
          { status: 400 }
        );
      }

      // Check if category with the same name already exists
      const existingCategory = await Category.findOne({ name: name.trim() });
      if (existingCategory) {
        return NextResponse.json(
          { success: false, message: 'A category with this name already exists' },
          { status: 400 }
        );
      }

      // Create new category
      const newCategory = new Category({
        name: name.trim(),
        description: description?.trim() || '',
        isFeatured: isFeatured || false
      });

      await newCategory.save();

      return NextResponse.json({
        success: true,
        message: 'Category created successfully',
        category: newCategory
      }, { status: 201 });
    } catch (error) {
      lastError = error;
      retries--;

      // If it's not a connection error, don't retry
      if (!error.message.includes('ETIMEOUT') && !error.message.includes('ENOTFOUND') && !error.message.includes('MongoServerSelectionError') && !error.message.includes('MongoNetworkError')) {
        // Handle specific mongoose validation errors
        if (error.name === 'ValidationError') {
          const errors = Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message
          }));
          
          return NextResponse.json(
            { 
              success: false, 
              message: 'Validation failed',
              errors
            },
            { status: 400 }
          );
        }
        
        // Generic error for other cases
        return NextResponse.json(
          { success: false, message: 'Failed to create category' },
          { status: 500 }
        );
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.error('Error creating category after retries:', lastError);
  return NextResponse.json(
    { success: false, message: 'Database connection error. Please try again later.' },
    { status: 500 }
  );
}
