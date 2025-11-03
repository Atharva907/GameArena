import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import UserModel from "@/models/User.models";
import { jwtVerify } from "jose";
import { isValidObjectId } from "mongoose";

export async function POST(request) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Parse request body
    const body = await request.json();
    const token = body?.token?.trim();

    if (!token) {
      return response(false, 400, "Missing token.");
    }

    const secret = new TextEncoder().encode(process.env.SECRET_KEY);

    // Verify JWT token
    let decoded;
    try {
      decoded = await jwtVerify(decodeURIComponent(token), secret);
    } catch (err) {
      console.error("JWT verification error:", err);
      return response(false, 400, "Invalid or expired token.");
    }

    const userId = decoded.payload.userId;

    // Validate ObjectId
    if (!isValidObjectId(userId)) {
      return response(false, 400, "Invalid user ID.");
    }

    // Find user
    const user = await UserModel.findById(userId);
    if (!user) {
      return response(false, 404, "User not found.");
    }

    // Already verified
    if (user.isEmailVerified) {
      return response(true, 200, "Email is already verified.");
    }

    // Mark as verified
    user.isEmailVerified = true;
    await user.save();

    return response(true, 200, "Email verification successful.");
  } catch (error) {
    return catchError(error);
  }
}
