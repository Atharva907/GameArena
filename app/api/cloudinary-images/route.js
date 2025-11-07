// Make sure the variables are loaded correctly
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY; // Changed from CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_SECRET_KEY; // Changed from CLOUDINARY_API_SECRET

// Log environment variables for debugging (without exposing secrets)
console.log('Cloudinary config check:', {
  cloud_name: cloudName ? 'Set' : 'Missing',
  api_key: apiKey ? 'Set' : 'Missing',
  api_secret: apiSecret ? 'Set' : 'Missing',
});

if (!cloudName || !apiKey || !apiSecret) {
  console.error('Missing Cloudinary credentials');
  return Response.json({ 
    error: 'Missing Cloudinary credentials',
    details: 'One or more required environment variables are missing'
  }, { status: 500 });
}

export async function GET() {
  try {
    // Use Basic Auth approach
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    
    // Build the URL with parameters
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=30`;
    
    console.log('Making request to:', url);
    
    // Make the request
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary API error response:', errorText);
      throw new Error(`Cloudinary API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Cloudinary API error:', error);
    return Response.json({ 
      error: 'Failed to fetch images from Cloudinary',
      details: error.message 
    }, { status: 500 });
  }
}
