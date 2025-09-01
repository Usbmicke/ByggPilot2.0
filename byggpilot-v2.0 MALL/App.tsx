
import React, { useState, useCallback } from 'react';
import { User } from './types';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

export const AuthContext = React.createContext<{
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}>({
  user: null,
  login: () => {},
  logout: () => {},
});


const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  
  const login = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const authContextValue = { user, login, logout };

  return (
    <AuthContext.Provider value={authContextValue}>
      {user ? <Dashboard /> : <Login />}
    </AuthContext.Provider>
  );
};

export default App;
