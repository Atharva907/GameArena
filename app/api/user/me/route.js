import { connectDB } from "@/lib/databaseConnection";
import { response } from "@/lib/helperFunction";
import UserModel from "@/models/User.models";
import { jwtVerify } from "jose";

export async function GET(request) {
  try {
    await connectDB();

    let token = request.cookies.get("token")?.value;
    console.log("Token from cookie:", token ? "Present" : "Missing");
    
    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
        console.log("Token from Authorization header:", token ? "Present" : "Missing");
      }
    }

    if (!token) {
      console.log("Authentication required: Token is missing from both cookies and Authorization header");
      return response(false, 401, "Authentication required");
    }

    const secret = new TextEncoder().encode(process.env.SECRET_KEY);
    console.log("Verifying token...");
    
    try {
      const { payload } = await jwtVerify(token, secret);
      console.log("Token verified successfully, payload:", payload);
      
      const userId = typeof payload.id === 'string' ? payload.id : payload.id.toString();
      const user = await UserModel.findById(userId);

      if (!user) {
        console.log("User not found with ID:", userId);
        return response(false, 404, "User not found");
      }
      
      console.log("User data found:", { id: user._id, name: user.name, email: user.email });

      return response(true, 200, "User data retrieved successfully", {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar?.url || "/assets/avatar.jpg",
      phone: user.phone,
      address: user.address,
      createdAt: user.createdAt
    });
    } catch (error) {
      console.error("Token verification error:", error);
      return response(false, 401, "Invalid or expired token");
    }

  } catch (error) {
    console.error("Error fetching user data:", error);
    return response(false, 500, "Failed to fetch user data");
  }
}
