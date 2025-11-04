// Cloudinary configuration
const cloudinary = require('cloudinary').v2;

// Debug environment variables
console.log("Environment variables check:");
console.log("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? "Set" : "Not set");
console.log("NEXT_PUBLIC_CLOUDINARY_API_KEY:", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ? "Set" : "Not set");
console.log("CLOUDINARY_SECRET_KEY:", process.env.CLOUDINARY_SECRET_KEY ? "Set" : "Not set");

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY
});

export async function GET() {
  try {
    // Fetch all image resources from Cloudinary
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'image',
      max_results: 100 // Adjust as needed
    });

    // Return the resources
    return Response.json(result);
  } catch (error) {
    console.error('Error fetching Cloudinary resources:', error);
    return Response.json(
      { error: 'Failed to fetch images from Cloudinary' },
      { status: 500 }
    );
  }
}
