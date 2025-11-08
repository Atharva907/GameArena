
import React from 'react';

const LeaderboardPage = () => {
  // Sample leaderboard data
  const leaderboardData = [
    { rank: 1, playerName: "ProGamer123", points: 9850, gamesPlayed: 142, winRate: 78.5 },
    { rank: 2, playerName: "ChampionX", points: 9720, gamesPlayed: 138, winRate: 76.1 },
    { rank: 3, playerName: "NinjaWarrior", points: 9500, gamesPlayed: 125, winRate: 74.2 },
    { rank: 4, playerName: "EliteSniper", points: 9280, gamesPlayed: 119, winRate: 72.8 },
    { rank: 5, playerName: "PhoenixRising", points: 9150, gamesPlayed: 112, winRate: 71.4 },
    { rank: 6, playerName: "ShadowHunter", points: 8970, gamesPlayed: 108, winRate: 69.9 },
    { rank: 7, playerName: "ThunderStrike", points: 8800, gamesPlayed: 101, winRate: 68.5 },
    { rank: 8, playerName: "IceQueen", points: 8620, gamesPlayed: 98, winRate: 67.3 },
    { rank: 9, playerName: "BlazeFury", points: 8450, gamesPlayed: 95, winRate: 66.2 },
    { rank: 10, playerName: "StormBringer", points: 8280, gamesPlayed: 92, winRate: 65.1 },
  ];

  // Get medal icon based on rank
  const getRankIcon = (rank) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
          1
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
          2
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
          3
        </div>
      );
    } else {
      return (
        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold">
          {rank}
        </div>
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Leaderboard</h1>

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Top Players</h2>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-[#00FFAA] text-black font-semibold rounded-lg hover:bg-opacity-80 transition-colors">
                This Week
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
                This Month
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
                All Time
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">Rank</th>
                  <th className="text-left py-3 px-4">Player</th>
                  <th className="text-left py-3 px-4">Points</th>
                  <th className="text-left py-3 px-4">Games Played</th>
                  <th className="text-left py-3 px-4">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((player) => (
                  <tr 
                    key={player.rank} 
                    className={`border-b border-gray-100 hover:bg-gray-50 ${player.rank <= 3 ? 'font-semibold' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {getRankIcon(player.rank)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#00FFAA] to-blue-500 rounded-full mr-3"></div>
                        <span>{player.playerName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{player.points.toLocaleString()}</td>
                    <td className="py-3 px-4">{player.gamesPlayed}</td>
                    <td className="py-3 px-4">{player.winRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-center">
            <button className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
              View More Players
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              Top Scorer
            </h3>
            <p className="text-2xl font-bold text-yellow-500 mb-1">ProGamer123</p>
            <p className="text-gray-600">9,850 points</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              Highest Win Rate
            </h3>
            <p className="text-2xl font-bold text-green-500 mb-1">ProGamer123</p>
            <p className="text-gray-600">78.5% win rate</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>
              </svg>
              Most Active
            </h3>
            <p className="text-2xl font-bold text-blue-500 mb-1">ProGamer123</p>
            <p className="text-gray-600">142 games played</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;