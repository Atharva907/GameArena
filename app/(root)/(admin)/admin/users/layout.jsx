import React from 'react';

export const metadata = {
  title: 'User Management',
  description: 'Manage users in the gameArena admin panel',
};

const UsersLayout = ({ children }) => {
  return (
    <div className="w-full">
      {children}
    </div>
  );
};

export default UsersLayout;
