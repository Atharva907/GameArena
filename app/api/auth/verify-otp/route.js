import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { zSchema } from "@/lib/zodSchema";
import OTPModel from "@/models/Otp.model";
import UserModel from "@/models/User.models";
import { SignJWT } from "jose";

export async function POST(request) {
  try {
    await connectDB();

    const payload = await request.json();

    // Validate payload
    const validationSchema = zSchema.pick({
      email: true,
      otp: true,
    });
    const validatedData = validationSchema.safeParse(payload);

    if (!validatedData.success) {
      return response(
        false,
        400,
        "Invalid or missing input field.",
        validatedData.error
      );
    }

    const email = validatedData.data.email.trim();
    const otp = validatedData.data.otp.trim();

    // Check OTP
    const otpRecord = await OTPModel.findOne({ email, otp });
    if (!otpRecord) {
      return response(false, 404, "Invalid or expired OTP.");
    }

    // Check user existence
    const user = await UserModel.findOne({ deletedAt: null, email }).lean();
    if (!user) {
      return response(false, 404, "User not found.");
    }

    // Generate JWT token valid for 24 hours
    const secret = new TextEncoder().encode(process.env.SECRET_KEY);
    const token = await new SignJWT({ email, id: user._id.toString() })
      .setIssuedAt()
      .setExpirationTime("24h")
      .setProtectedHeader({ alg: "HS256" })
      .sign(secret);

    // Delete OTP after successful verification
    await otpRecord.deleteOne();

    // ✅ Return user details including role
    return response(true, 200, "OTP verified successfully.", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role, // 👈 important for frontend redirect
      isEmailVerified: user.isEmailVerified,
      token: token,
    });
  } catch (error) {
    return catchError(error);
  }
}
