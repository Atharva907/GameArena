import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

export async function POST(request) {
  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { success: false, message: 'Public ID is required' },
        { status: 400 }
      );
    }

    // Delete the image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok' || result.result === 'not found') {
      return NextResponse.json({
        success: true,
        message: 'Image deleted successfully',
      });
    } else {
      throw new Error(`Failed to delete image: ${result.result}`);
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete image',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
