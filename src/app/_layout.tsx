import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import {
  useFonts as useInterFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { LightTheme, DarkTheme } from '../theme';
import { AuthProvider } from '../context/AuthContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const theme = colorScheme === 'dark' ? DarkTheme : LightTheme;

  return (
    <AuthProvider>
      <ThemeProvider value={theme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="interests" />
          <Stack.Screen name="home" />
          <Stack.Screen name="explore" />
          <Stack.Screen name="symptom-checker" />
          <Stack.Screen name="my-care-plan" />
          <Stack.Screen name="add-to-plan" />
          <Stack.Screen name="reminders" />
          <Stack.Screen name="calendar" />
          <Stack.Screen name="learn" />
          <Stack.Screen name="safety" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="herb/[id]" />
          {/* New screens */}
          <Stack.Screen name="article/[id]" />
          <Stack.Screen name="saved-herbs" />
          <Stack.Screen name="my-care" />
          <Stack.Screen name="search" />
          <Stack.Screen name="assistant" />
          <Stack.Screen name="journal" />
          <Stack.Screen name="health-preferences" />
          <Stack.Screen name="about" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
