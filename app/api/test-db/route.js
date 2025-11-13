import { connectDB } from "@/lib/databaseConnection";
import { response } from "@/lib/helperFunction";
import Tournament from "@/models/Tournament";

export async function GET() {
    try {
        console.log("Testing MongoDB connection...");
        const conn = await connectDB();
        console.log("Connection state:", conn.connection.readyState);
        
        // Test update operation
        console.log("Testing tournament update operation...");
        const tournament = await Tournament.findOne();
        
        if (!tournament) {
            console.log("No tournaments found in database");
            return response(true, 200, "Database connection successful but no tournaments found", {
                readyState: conn.connection.readyState,
                host: conn.connection.host,
                name: conn.connection.name
            });
        }
        
        console.log("Found tournament:", tournament._id);
        
        // Try to update the tournament
        const originalName = tournament.name;
        const testName = originalName + " [TEST]";
        
        const updatedTournament = await Tournament.findByIdAndUpdate(
            tournament._id,
            { name: testName },
            { new: true }
        );
        
        console.log("Updated tournament with test name:", updatedTournament.name);
        
        // Revert the change
        const revertedTournament = await Tournament.findByIdAndUpdate(
            tournament._id,
            { name: originalName },
            { new: true }
        );
        
        console.log("Reverted tournament name:", revertedTournament.name);

        return response(true, 200, "Database connection and update operation successful", {
            readyState: conn.connection.readyState,
            host: conn.connection.host,
            name: conn.connection.name,
            tournamentId: tournament._id,
            updateTest: "Successful"
        });
    } catch (error) {
        console.error("Database connection or update failed:", error);

        return response(false, 500, "Database connection or update failed", {
            error: error.message,
            name: error.name,
            reason: error.reason
        });
    }
}
