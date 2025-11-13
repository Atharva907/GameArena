import { connectDB } from "@/lib/databaseConnection";
import { ObjectId } from "databaseConnection";
import Player from "@/models/Player";

export async function POST(request) {
  try {
    const {
      tournamentId,
      playerEmail,
      playerName,
      dateOfBirth,
      city,
      state,
      teamName,
      contactNumber
    } = await request.json();

    // Validate required fields
    if (!tournamentId || !playerEmail || !playerName || !dateOfBirth || !city || !state) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate tournament ID
    if (!ObjectId.isValid(tournamentId)) {
      return Response.json(
        { error: "Invalid tournament ID" },
        { status: 400 }
      );
    }

    const db = await connectDB();

    // Check if tournament exists
    const tournament = await db.db.collection("tournaments").findOne({ _id: new ObjectId(tournamentId) });
    if (!tournament) {
      return Response.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    // Check if player is already registered for this tournament
    const existingRegistration = await db.db.collection("tournamentRegistrations").findOne({
      tournamentId: new ObjectId(tournamentId),
      playerEmail: playerEmail
    });

    if (existingRegistration) {
      return Response.json(
        { error: "You are already registered for this tournament" },
        { status: 400 }
      );
    }
    
    // Check if tournament has entry fee
    const entryFee = tournament.entryFee;
    let feeAmount = 0;
    
    if (entryFee && entryFee !== "Free") {
      // Extract numeric value from entry fee string (e.g., "$10" -> 10)
      feeAmount = parseFloat(entryFee.replace(/[^0-9.-]+/g, ""));
      
      // Find player and check wallet balance
      const player = await Player.findOne({ email: playerEmail });
      
      if (!player) {
        return Response.json(
          { error: "Player not found" },
          { status: 404 }
        );
      }
      
      if (player.walletBalance < feeAmount) {
        return Response.json(
          { error: `Insufficient balance. Required: ${entryFee}, Available: $${player.walletBalance}` },
          { status: 400 }
        );
      }
    }

    // Create new registration
    const newRegistration = {
      tournamentId: new ObjectId(tournamentId),
      playerEmail,
      playerName,
      dateOfBirth,
      city,
      state,
      teamName: teamName || "",
      contactNumber: contactNumber || "",
      paid: true,
      createdAt: new Date()
    };

    // Start a transaction for registration
    const session = await db.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Insert registration
        const result = await db.db.collection("tournamentRegistrations").insertOne(newRegistration, { session });
        
        if (!result.acknowledged) {
          throw new Error("Failed to register for tournament");
        }
        
        // If there's an entry fee, deduct from wallet and create transaction
        if (feeAmount > 0) {
          // Update player wallet balance
          await Player.findOneAndUpdate(
            { email: playerEmail },
            { $inc: { walletBalance: -feeAmount } },
            { session }
          );
          
          // Create transaction record
          const transaction = {
            id: new ObjectId().toString(),
            date: new Date().toLocaleDateString(),
            type: "Tournament Entry Fee",
            amount: -feeAmount,
            status: "completed",
            description: `Registration fee for ${tournament.name}`,
            tournamentId: tournamentId
          };
          
          // Add transaction to wallet
          await db.db.collection("wallets").updateOne(
            { playerEmail: playerEmail },
            { 
              $push: { transactions: { $each: [transaction], $position: 0 } }
            },
            { upsert: true, session }
          );
        }
        
        return {
          success: true,
          message: "Registration successful",
          data: {
            id: result.insertedId,
            ...newRegistration,
            tournamentId: tournamentId // Convert back to string for JSON response
          }
        };
      });
      
      return Response.json({
        success: true,
        message: "Registration successful"
      });
    } catch (error) {
      console.error("Transaction failed:", error);
      return Response.json(
        { error: "Failed to register for tournament" },
        { status: 500 }
      );
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error("Error registering for tournament:", error);
    return Response.json(
      { error: "Failed to register for tournament" },
      { status: 500 }
    );
  }
}
