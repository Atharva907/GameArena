export const tournamentsData = [
  {
    id: 1,
    name: "Valorant Blitz Cup",
    date: "Nov 10, 2025",
    entryFee: "$10",
    prize: "$500",
    game: "Valorant",
    maxPlayers: 64,
    currentPlayers: 42,
    status: "upcoming", 
    format: "5v5",
    region: "NA",
    description: "Compete in this fast-paced Valorant tournament with top teams from North America.",
    rules: "Standard competitive rules, best of 3 maps.",
    prizes: ["1st: $500", "2nd: $250", "3rd: $100"],
    organizer: "Elite Esports",
    imageUrl: "/images/tournaments/valorant-blitz.jpg"
  },
  {
    id: 2,
    name: "CS2 Battle Arena",
    date: "Nov 18, 2025",
    entryFee: "$8",
    prize: "$300",
    game: "CS2",
    maxPlayers: 32,
    currentPlayers: 28,
    status: "upcoming",
    format: "5v5",
    region: "EU",
    description: "Join the ultimate CS2 battle with European teams.",
    rules: "MR12 format, single elimination bracket.",
    prizes: ["1st: $300", "2nd: $150", "3rd: $75"],
    organizer: "Pro Gaming League",
    imageUrl: "/images/tournaments/cs2-battle.jpg"
  },
  {
    id: 3,
    name: "Apex Legends Rampage",
    date: "Dec 1, 2025",
    entryFee: "Free",
    prize: "$150",
    game: "Apex Legends",
    maxPlayers: 60,
    currentPlayers: 45,
    status: "upcoming",
    format: "Trios",
    region: "Global",
    description: "Free-to-enter Apex Legends tournament with cash prizes.",
    rules: "Standard battle royale rules, 3 matches total.",
    prizes: ["1st: $150", "2nd: $75", "3rd: $25"],
    organizer: "Apex Masters",
    imageUrl: "/images/tournaments/apex-rampage.jpg"
  },
  {
    id: 4,
    name: "League of Legends Championship",
    date: "Dec 15, 2025",
    entryFee: "$15",
    prize: "$1000",
    game: "League of Legends",
    maxPlayers: 128,
    currentPlayers: 96,
    status: "upcoming",
    format: "5v5",
    region: "Global",
    description: "Premier LoL tournament with significant prize pool.",
    rules: "Tournament realm, best of 3 until finals (best of 5).",
    prizes: ["1st: $1000", "2nd: $500", "3rd: $250", "4th: $100"],
    organizer: "League Masters",
    imageUrl: "/images/tournaments/lol-championship.jpg"
  }
];

// Mock wallet transaction data
export const transactionData = [
  { id: 1, date: "Oct 18, 2025", type: "Tournament Win", amount: 150, tournamentId: 2, status: "completed" },
  { id: 2, date: "Oct 10, 2025", type: "Withdrawal", amount: -100, status: "completed" },
  { id: 3, date: "Sep 25, 2025", type: "Tournament Win", amount: 225, tournamentId: 1, status: "completed" },
  { id: 4, date: "Sep 15, 2025", type: "Tournament Entry Fee", amount: -10, tournamentId: 3, status: "completed" },
  { id: 5, date: "Sep 5, 2025", type: "Bonus", amount: 50, description: "Welcome bonus", status: "completed" },
  { id: 6, date: "Aug 28, 2025", type: "Tournament Win", amount: 75, tournamentId: 4, status: "completed" },
  { id: 7, date: "Aug 15, 2025", type: "Deposit", amount: 100, status: "completed" },
  { id: 8, date: "Aug 10, 2025", type: "Withdrawal", amount: -50, status: "completed" }
];

// Mock user profile data
export const userProfileData = {
  id: "user123",
  username: "Player123",
  email: "player@example.com",
  fullName: "John Doe",
  avatar: "/images/avatars/player123.jpg",
  level: 42,
  xp: 2450,
  xpToNextLevel: 3000,
  memberSince: "September 2023",
  rank: "Diamond",
  stats: {
    tournamentsPlayed: 8,
    wins: 3,
    winRate: 37.5,
    totalEarnings: 450,
    favoriteGames: ["Valorant", "CS2", "Apex Legends"]
  },
  achievements: [
    { id: 1, name: "First Win", description: "Won your first tournament", icon: "trophy", unlocked: true },
    { id: 2, name: "Sharpshooter", description: "Achieved 80% accuracy in a match", icon: "target", unlocked: true },
    { id: 3, name: "Team Player", description: "Played with 10 different teammates", icon: "users", unlocked: true },
    { id: 4, name: "Veteran", description: "Participated in 10 tournaments", icon: "medal", unlocked: false },
    { id: 5, name: "Champion", description: "Won 5 tournaments", icon: "crown", unlocked: false }
  ]
};
