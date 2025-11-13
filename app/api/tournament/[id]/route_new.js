import { connectDB } from "@/lib/databaseConnection";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  const { id } = params;

  try {
    const db = await connectDB();
    const tournament = await db.connection.db
      .collection("tournaments")
      .findOne({ _id: new ObjectId(id) });

    if (!tournament) {
      return new Response(JSON.stringify({ error: "Tournament not found" }), {
        status: 404
      });
    }

    return new Response(JSON.stringify(tournament), {
      status: 200
    });
  } catch (error) {
    console.error("Error fetching tournament:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500
    });
  }
}