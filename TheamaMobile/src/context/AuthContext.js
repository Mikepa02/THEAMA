import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const token = await AsyncStorage.getItem('@theama_token');
      const userData = await AsyncStorage.getItem('@theama_user');
      const guest = await AsyncStorage.getItem('@theama_guest');
      if (token && userData) {
        setUser(JSON.parse(userData));
      } else if (guest === 'true') {
        setIsGuest(true);
      }
    } catch (e) {
      console.error('Error loading user:', e);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const response = await api.post('/login', { email, password });
    const { token, user: userData } = response.data;
    await AsyncStorage.setItem('@theama_token', token);
    await AsyncStorage.setItem('@theama_user', JSON.stringify(userData));
    await AsyncStorage.removeItem('@theama_guest');
    setIsGuest(false);
    setUser(userData);
    return userData;
  }

  async function register(name, email, password) {
    await api.post('/register', { name, email, password });
    return login(email, password);
  }

  async function continueAsGuest() {
    await AsyncStorage.setItem('@theama_guest', 'true');
    setIsGuest(true);
  }

  async function logout() {
    await AsyncStorage.removeItem('@theama_token');
    await AsyncStorage.removeItem('@theama_user');
    await AsyncStorage.removeItem('@theama_guest');
    setUser(null);
    setIsGuest(false);
  }

  return (
    <AuthContext.Provider value={{ user, isGuest, loading, login, register, logout, continueAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
