import { apiFetch } from "@/lib/apiClient";

// Function to get player data from API
export const getPlayerData = async () => {
  try {
    // Check if cookies are available
    if (typeof window !== 'undefined') {
      console.log('Document cookies:', document.cookie);
    }
    
    // Get token from cookies first
    let token = null;
    try {
      token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    } catch (e) {
      console.error("Error getting token from cookies:", e);
    }

    // If no token in cookies, try to get from Redux store
    if (!token && typeof window !== 'undefined') {
      try {
        const persistState = localStorage.getItem('persist:root');
        if (persistState) {
          const parsedState = JSON.parse(persistState);
          if (parsedState.authStore) {
            const authData = JSON.parse(parsedState.authStore);
            token = authData.auth?.token;
            console.log('Found token in Redux store');
          }
        }
      } catch (e) {
        console.error("Error getting token from Redux store:", e);
      }
    }

    const headers = {
      'Content-Type': 'application/json',
    };

    // Add token to Authorization header if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await apiFetch("/user/me", {
      method: "GET",
      headers,
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(errorData.message || `Failed to fetch user data (${response.status})`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch user data');
    }

    // Transform user data to player data format
    const userData = data.data;
    const playerData = {
      id: userData.id,
      username: userData.name,
      email: userData.email,
      avatar: userData.avatar,
      level: Math.floor(Math.random() * 50) + 1, // Random level for demo
      rank: Math.random() > 0.5 ? 'PRO PLAYER' : 'AMATEUR', // Random rank for demo
      memberSince: new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      stats: {
        tournaments: Math.floor(Math.random() * 20) + 1, // Random stats for demo
        wins: Math.floor(Math.random() * 10) + 1,
        winRate: Math.floor(Math.random() * 100),
        points: Math.floor(Math.random() * 5000) + 500
      },
      recentTournaments: [
        {
          id: 1,
          name: 'Valorant Cup',
          date: 'Oct 15, 2025',
          result: 'Semi-Finalist',
          icon: 'Trophy',
          color: 'from-red-500 to-orange-500'
        },
        {
          id: 2,
          name: 'CS2 Battle',
          date: 'Sep 30, 2025',
          result: 'Winner',
          icon: 'Shield',
          color: 'from-blue-500 to-cyan-500'
        },
        {
          id: 3,
          name: 'Apex Championship',
          date: 'Sep 15, 2025',
          result: 'Quarter-Finalist',
          icon: 'Trophy',
          color: 'from-purple-500 to-pink-500'
        }
      ],
      favoriteGames: [
        'Valorant',
        'CS2',
        'Apex Legends',
        'League of Legends',
        'Overwatch 2'
      ]
    };

    return playerData;
  } catch (error) {
    console.error("Error fetching player data:", error);
    throw error;
  }
};

// Function to get player initials for avatar fallback
export const getPlayerInitials = (username) => {
  if (!username) return 'P';
  return username.substring(0, 2).toUpperCase();
};
