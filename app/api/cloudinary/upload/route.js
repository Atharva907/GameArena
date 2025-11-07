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
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Add folder and tags to organize images
    const options = {
      folder: 'gamearena',
      resource_type: 'auto',
      tags: ['gamearena', 'media-library'],
    };

    return new Promise((resolve) => {
      cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) {
            console.error('Error uploading to Cloudinary:', error);
            resolve(
              NextResponse.json(
                { success: false, message: 'Upload failed', error: error.message },
                { status: 500 }
              )
            );
          } else {
            console.log('Upload successful:', result.public_id);
            resolve(
              NextResponse.json({
                success: true,
                message: 'Upload successful',
                data: {
                  url: result.secure_url,
                  public_id: result.public_id,
                  resource_type: result.resource_type,
                  format: result.format,
                  width: result.width,
                  height: result.height,
                }
              })
            );
          }
        }
      ).end(buffer);
    });
  } catch (error) {
    console.error('Error in upload API:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Upload failed', 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
