import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface DataContextType {
  loggedInUser: User | null;
  loading: boolean;
  isUpdating: boolean;
  loans: any[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating] = useState(false);
  const [loans] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'https://kobarapide.onrender.com';

  // Charger l'utilisateur depuis localStorage au démarrage
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        setLoading(false);
        return;
      }

      try {
        // Vérifier que le token est toujours valide
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: { 'x-auth-token': token }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Utilisateur rechargé depuis token:', data.user?.email);
          setLoggedInUser(data.user);
        } else {
          // Token invalide, nettoyer le localStorage
          console.log('⚠️ Token invalide ou expiré, déconnexion');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement de l\'utilisateur:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [API_URL]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setLoggedInUser(data.user);
    } catch (err: any) {
      console.error('Login error:', err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setLoggedInUser(null);
  };

  return (
    <DataContext.Provider value={{ loggedInUser, loading, isUpdating, loans, login, logout }}>
      {children}
    </DataContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useAppContext must be used within DataProvider');
  return context;
}