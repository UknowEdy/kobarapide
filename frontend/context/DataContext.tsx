import React, { createContext, useContext } from 'react';

const DataContext = createContext<any>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [loading] = React.useState(false);
  const [isUpdating] = React.useState(false);
  const [loans] = React.useState([]);
  const [loggedInUser] = React.useState(null);

  return (
    <DataContext.Provider value={{ loading, isUpdating, loans, loggedInUser, logout: () => {} }}>
      {children}
    </DataContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useAppContext must be used within DataProvider');
  return context;
}
