import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { colors } from './src/theme/colors';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import TheatresScreen from './src/screens/TheatresScreen';
import ShowsScreen from './src/screens/ShowsScreen';
import ShowtimesScreen from './src/screens/ShowtimesScreen';
import SeatsScreen from './src/screens/SeatsScreen';
import ConfirmationScreen from './src/screens/ConfirmationScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AdminScreen from './src/screens/AdminScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.dark, card: colors.dark, text: colors.white, primary: colors.accent, border: colors.border },
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Theatres" component={TheatresScreen} />
      <Stack.Screen name="Shows" component={ShowsScreen} />
      <Stack.Screen name="Showtimes" component={ShowtimesScreen} />
      <Stack.Screen name="Seats" component={SeatsScreen} />
      <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { isGuest } = useAuth();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1A1A2E', borderTopColor: colors.border, borderTopWidth: 1, paddingTop: 8, paddingBottom: 8, height: 60 },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color }) => {
          let emoji = '🏠';
          if (route.name === 'Αρχική') emoji = '🏠';
          if (route.name === 'Προφίλ') emoji = '👤';
          return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
        },
      })}
    >
      <Tab.Screen name="Αρχική" component={HomeStack} />
      {!isGuest && <Tab.Screen name="Προφίλ" component={ProfileScreen} />}
    </Tab.Navigator>
  );
}

function AppContent() {
  const { user, isGuest, loading } = useAuth();
  if (loading) {
    return <View style={{ flex: 1, backgroundColor: colors.dark, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator color={colors.accent} size="large" /></View>;
  }

  const isAdmin = user?.email === 'admin@theama.gr';

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAdmin ? (
          <Stack.Screen name="Admin" component={AdminScreen} />
        ) : (user || isGuest) ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppContent />
    </AuthProvider>
  );
}
