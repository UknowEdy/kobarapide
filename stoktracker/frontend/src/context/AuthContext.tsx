import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { STORAGE_KEYS } from '@/config/api';
import api from '@/services/api';
import syncService from '@/services/sync';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, pin: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    name: string;
    phone: string;
    pin: string;
    businessName?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger l'utilisateur depuis le localStorage au démarrage
    const loadUser = () => {
      try {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        if (userStr) {
          const userData: User = JSON.parse(userStr);
          setUser(userData);
          // Démarrer la synchronisation automatique
          syncService.startAutoSync();
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        localStorage.removeItem(STORAGE_KEYS.USER);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    return () => {
      // Arrêter la synchronisation au démontage
      syncService.stopAutoSync();
    };
  }, []);

  const login = async (
    phone: string,
    pin: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.login(phone, pin);

      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
        // Démarrer la synchronisation
        syncService.startAutoSync();
        return { success: true };
      }

      return {
        success: false,
        message: response.message || 'Échec de la connexion'
      };
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur de connexion'
      };
    }
  };

  const register = async (data: {
    name: string;
    phone: string;
    pin: string;
    businessName?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.register(data);

      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
        // Démarrer la synchronisation
        syncService.startAutoSync();
        return { success: true };
      }

      return {
        success: false,
        message: response.message || 'Échec de l\'inscription'
      };
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur d\'inscription'
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    syncService.stopAutoSync();
    window.location.href = '/login';
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
