import { connectDB } from "@/lib/databaseConnection";
import GameTournamentRegistration from "@/models/GameTournamentRegistration.models";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    // First check if there are any registrations at all
    const allRegistrations = await GameTournamentRegistration.find({});
    console.log("All registrations in database:", allRegistrations.length);
    if (allRegistrations.length > 0) {
      console.log("Sample registration:", JSON.stringify(allRegistrations[0], null, 2));
    }

    // Build query based on filters
    let query = {};

    // Get total count for pagination
    const total = await GameTournamentRegistration.countDocuments(query);

    // Fetch registrations with pagination
    const registrations = await GameTournamentRegistration.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log("Query results count:", registrations.length);
    if (registrations.length > 0) {
      console.log("Sample query result:", JSON.stringify(registrations[0], null, 2));
    }

    return NextResponse.json({
      success: true,
      data: {
        registrations,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error("Error fetching tournament registrations:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Failed to fetch tournament registrations",
        error: error.message 
      },
      { status: 500 }
    );
  }
}
