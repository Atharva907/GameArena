// Test endpoint specifically for testing the PUT operation
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/databaseConnection';
import Tournament from '@/models/Tournament';

export async function GET() {
  try {
    // Connect to the database
    await connectDB();

    // Get the first tournament for testing
    const tournament = await Tournament.findOne();

    if (!tournament) {
      return NextResponse.json(
        { message: "No tournaments found in database" },
        { status: 404 }
      );
    }

    // Create test data
    const testData = {
      id: tournament._id.toString(),
      name: tournament.name + " [TEST UPDATE]",
      description: tournament.description,
      game: tournament.game,
      startDate: tournament.startDate,
      endDate: tournament.endDate,
      startTime: tournament.startTime,
      endTime: tournament.endTime,
      location: tournament.location,
      maxParticipants: tournament.maxParticipants,
      status: tournament.status,
      entryFee: tournament.entryFee || "Free",
      region: tournament.region || "Global",
      format: tournament.format || "Solo",
      platform: tournament.platform || "PC",
      prize: tournament.prize,
      rules: tournament.rules,
      imageUrl: tournament.imageUrl
    };

    console.log("Test data for PUT endpoint:", testData);

    // Simulate the PUT operation
    const { id: tournamentId, ...updateData } = testData;

    const updatedTournament = await Tournament.findOneAndUpdate(
      { _id: tournamentId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    console.log("Updated tournament:", updatedTournament);

    // Verify the update
    const verifiedTournament = await Tournament.findById(tournamentId);
    console.log("Verified tournament from database:", verifiedTournament);

    // Revert the change
    const revertedTournament = await Tournament.findOneAndUpdate(
      { _id: tournamentId },
      { $set: { name: tournament.name } },
      { new: true }
    );

    console.log("Reverted tournament name:", revertedTournament.name);

    return NextResponse.json({
      message: "PUT operation test successful",
      originalTournament: tournament,
      updatedTournament: updatedTournament,
      revertedTournament: revertedTournament
    });
  } catch (error) {
    console.error("PUT operation test error:", error);
    return NextResponse.json(
      { message: "PUT operation test failed", error: error.message },
      { status: 500 }
    );
  }
}
