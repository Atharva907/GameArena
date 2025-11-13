import { connectDB } from "@/lib/databaseConnection";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const tournamentId = id;

    // Validate tournament ID
    if (!ObjectId.isValid(tournamentId)) {
      return Response.json(
        { error: "Invalid tournament ID" },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await connectDB();

    // Fetch registration details
    const registration = await db.db.collection("tournamentRegistrations").findOne({
      tournamentId: new ObjectId(tournamentId)
    });

    if (!registration) {
      return Response.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    // Convert ObjectId to string for JSON serialization
    const registrationData = {
      ...registration,
      tournamentId: registration.tournamentId.toString()
    };

    return Response.json(registrationData);
  } catch (error) {
    console.error("Error fetching registration:", error);
    return Response.json(
      { error: "Failed to fetch registration" },
      { status: 500 }
    );
  }
}
