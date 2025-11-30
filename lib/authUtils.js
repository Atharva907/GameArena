export const getCurrentUser = () => {
  try {
    if (typeof window !== 'undefined') {
      const persistState = localStorage.getItem('persist:root');
      if (persistState) {
        const parsedState = JSON.parse(persistState);
        if (parsedState.authStore) {
          const authData = JSON.parse(parsedState.authStore);
          return authData.auth;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Check if user is authenticated
export const isUserAuthenticated = () => {
  const currentUser = getCurrentUser();
  return currentUser && currentUser.id && currentUser.email;
};
