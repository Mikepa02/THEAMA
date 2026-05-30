import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Στο Web χρησιμοποιούμε localhost, στο emulator 10.0.2.2
const API_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000' 
  : 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor για JWT
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@theama_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
