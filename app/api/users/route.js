import { connectDB } from "@/lib/databaseConnection";
import User from "@/models/User.models";
import { response, catchError } from "@/lib/helperFunction";
import bcrypt from "bcryptjs";

export async function GET(request) {
  try {
    await connectDB();

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    // Build query based on parameters
    const query = { deletedAt: null };
    if (role) query.role = role;

    // Fetch users with pagination
    const users = await User.find(query)
      .select('-password') // Exclude password from results
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await User.countDocuments(query);

    return response(true, 200, "Users retrieved successfully", {
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return catchError(error);
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const userData = await request.json();

    // Check if user with this email already exists
    const existingUser = await User.findOne({ 
      email: userData.email, 
      deletedAt: null 
    });

    if (existingUser) {
      return response(false, 409, "User with this email already exists");
    }

    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    // Create new user
    const newUser = new User(userData);
    await newUser.save();

    // Return user without password
    const userResponse = await User.findById(newUser._id).select('-password');

    return response(true, 201, "User created successfully", userResponse);
  } catch (error) {
    return catchError(error);
  }
}

export async function PUT(request) {
  try {
    await connectDB();

    const { id, ...updateData } = await request.json();

    if (!id) {
      return response(false, 400, "User ID is required");
    }

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return response(false, 404, "User not found");
    }

    return response(true, 200, "User updated successfully", updatedUser);
  } catch (error) {
    return catchError(error);
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return response(false, 400, "User ID is required");
    }

    // Soft delete by setting deletedAt
    const deletedUser = await User.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!deletedUser) {
      return response(false, 404, "User not found");
    }

    return response(true, 200, "User deleted successfully", deletedUser);
  } catch (error) {
    return catchError(error);
  }
}
