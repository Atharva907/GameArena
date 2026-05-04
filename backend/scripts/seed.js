import { connectPostgres, disconnectPostgres, prisma } from "../src/lib/postgres.js";

const tournaments = [
  {
    name: "Summer Championship",
    game: "Valorant",
    description:
      "A competitive Valorant tournament for regional teams and ranked squads.",
    startDate: "2026-06-15",
    endDate: "2026-06-20",
    startTime: "10:00",
    endTime: "18:00",
    location: "Online",
    maxParticipants: 32,
    currentParticipants: 0,
    status: "UPCOMING",
    entryFee: "100",
    region: "India",
    format: "SQUAD",
    platform: "PC",
    prize: "INR 50,000",
    rules: "Standard 5v5 single-elimination rules apply.",
    imageUrl: "/assets/images/games/valorant.webp",
  },
  {
    name: "BGMI Mobile Cup",
    game: "BGMI",
    description:
      "A mobile battle royale event for BGMI players with wallet-based entry.",
    startDate: "2026-07-10",
    endDate: "2026-07-12",
    startTime: "14:00",
    endTime: "20:00",
    location: "Online",
    maxParticipants: 100,
    currentParticipants: 0,
    status: "UPCOMING",
    entryFee: "50",
    region: "India",
    format: "SQUAD",
    platform: "MOBILE",
    prize: "INR 25,000",
    rules: "Squad format with standard battle royale scoring.",
    imageUrl: "/assets/images/games/bgmi.jpg",
  },
];

async function seedDatabase() {
  try {
    await connectPostgres();

    const existingTournaments = await prisma.tournament.count();
    if (existingTournaments > 0) {
      console.log("Tournaments already exist. Skipping tournament seed.");
      return;
    }

    await prisma.tournament.createMany({
      data: tournaments,
    });
    console.log("Tournament seed completed.");
  } catch (error) {
    console.error("Tournament seed failed:", error);
    process.exitCode = 1;
  } finally {
    await disconnectPostgres();
  }
}

seedDatabase();
