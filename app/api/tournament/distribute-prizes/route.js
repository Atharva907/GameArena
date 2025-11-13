
import { connectDB } from "@/lib/databaseConnection";
import { ObjectId } from "mongodb";
import Player from "@/models/Player";

export async function POST(request) {
  try {
    const {
      tournamentId,
      winners // Array of { playerEmail, position, prizeAmount }
    } = await request.json();

    if (!tournamentId || !winners || !Array.isArray(winners)) {
      return Response.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const db = await connectDB();

    // Process each winner
    const results = await Promise.all(winners.map(async (winner) => {
      try {
        const { playerEmail, position, prizeAmount } = winner;

        if (!playerEmail || !prizeAmount || parseFloat(prizeAmount) <= 0) {
          return { 
            success: false, 
            playerEmail, 
            error: "Invalid winner data" 
          };
        }

        // Update player wallet balance
        const updatedPlayer = await Player.findOneAndUpdate(
          { email: playerEmail },
          { $inc: { walletBalance: parseFloat(prizeAmount) } },
          { new: true }
        );

        if (!updatedPlayer) {
          return { 
            success: false, 
            playerEmail, 
            error: "Player not found" 
          };
        }

        // Create transaction record
        const transaction = {
          id: new ObjectId().toString(),
          date: new Date().toLocaleDateString(),
          type: "Tournament Win",
          amount: parseFloat(prizeAmount),
          status: "completed",
          description: `Prize for position ${position} in tournament`,
          tournamentId: tournamentId
        };

        // Add transaction to wallet
        await db.db.collection("wallets").updateOne(
          { playerEmail: playerEmail },
          { 
            $push: { transactions: { $each: [transaction], $position: 0 } }
          },
          { upsert: true }
        );

        return { 
          success: true, 
          playerEmail, 
          newBalance: updatedPlayer.walletBalance,
          transaction 
        };
      } catch (error) {
        console.error(`Error processing prize for ${winner.playerEmail}:`, error);
        return { 
          success: false, 
          playerEmail: winner.playerEmail, 
          error: "Failed to process prize" 
        };
      }
    }));

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    if (failureCount > 0) {
      return Response.json({
        success: false,
        message: `${successCount} prizes distributed successfully, ${failureCount} failed`,
        results
      }, { status: 207 }); // Multi-Status
    }

    return Response.json({
      success: true,
      message: "All prizes distributed successfully",
      results
    });
  } catch (error) {
    console.error("Error distributing tournament prizes:", error);
    return Response.json(
      { error: "Failed to distribute prizes" },
      { status: 500 }
    );
  }
}
