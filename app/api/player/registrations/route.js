import mongoose from "mongoose";

export async function GET(request) {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);

    // Get all registrations from tournamentRegistrations collection
    const registrations = await mongoose.connection.db.collection("tournamentRegistrations").find({}).toArray();

    if (registrations.length === 0) {
      return Response.json({ data: [] });
    }

    // Get unique tournament IDs
    const tournamentIds = [...new Set(registrations.map(reg => reg.tournamentId))];

    // Fetch tournament details
    const tournaments = await mongoose.connection.db.collection("tournaments")
      .find({ _id: { $in: tournamentIds } })
      .toArray();

    // Map registrations to tournaments
    const tournamentsWithRegistrations = tournaments.map(tournament => {
      const registration = registrations.find(reg => 
        reg.tournamentId.toString() === tournament._id.toString()
      );

      return {
        ...tournament,
        registrationDate: registration?.registrationDate,
        playerEmail: registration?.playerEmail,
        _id: tournament._id.toString()
      };
    });

    return Response.json({ data: tournamentsWithRegistrations });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return Response.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
