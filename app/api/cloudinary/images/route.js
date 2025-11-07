import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const next_cursor = searchParams.get('next_cursor');
    const max_results = searchParams.get('max_results') || 20;

    // Build options for the API call
    const options = {
      max_results: parseInt(max_results),
      type: 'upload',
      // Try without prefix first to see if there are any images at all
      // prefix: 'gamearena',
    };

    if (next_cursor) {
      options.next_cursor = next_cursor;
    }

    console.log('Cloudinary config:', {
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    });
    
    console.log('Fetching images with options:', options);
    
    // Fetch images from Cloudinary
    const result = await cloudinary.api.resources(options);
    
    console.log('Cloudinary response:', {
      total_count: result.total_count,
      resources_count: result.resources?.length || 0,
    });

    return NextResponse.json({
      success: true,
      resources: result.resources,
      next_cursor: result.next_cursor,
      total_count: result.total_count,
    });
  } catch (error) {
    console.error('Error fetching images from Cloudinary:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch images from Cloudinary',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
