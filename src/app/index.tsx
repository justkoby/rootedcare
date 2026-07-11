import React, { useEffect } from 'react';
import { StyleSheet, Text, useColorScheme, StatusBar, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';

const DURATION = 400;

export default function SplashScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  const bgOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.85);
  const logoOpacity = useSharedValue(0);
  const nameTranslateY = useSharedValue(20);
  const nameOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const nameStyle = useAnimatedStyle(() => ({
    opacity: nameOpacity.value,
    transform: [{ translateY: nameTranslateY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  useEffect(() => {
    bgOpacity.value = withTiming(1, { duration: DURATION, easing: Easing.out(Easing.ease) });

    logoOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) })
    );
    logoScale.value = withDelay(
      400,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.2)) })
    );

    nameOpacity.value = withDelay(
      900,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) })
    );
    nameTranslateY.value = withDelay(
      900,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) })
    );

    taglineOpacity.value = withDelay(
      1300,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) })
    );

    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  const gradientColors = colorScheme === 'dark'
    ? ['#1F1A17', '#100D0B'] as const
    : ['#F5ECE3', '#E3D3C4'] as const;

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <Animated.View style={[styles.content, bgStyle]}>
        <Animated.View style={logoStyle}>
          <Image
            source={require('../assets/icon.png')}
            style={styles.logoIcon}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={nameStyle}>
          <Text style={[styles.appName, { color: colors.primary }]}>RootedCare</Text>
        </Animated.View>

        <Animated.View style={taglineStyle}>
          <Text style={[styles.tagline, { color: colors.textMuted }]}>
            Your Guide to Natural Wellness
          </Text>
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    width: 96,
    height: 96,
    borderRadius: 24,
  },
  appName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 36,
    marginTop: 24,
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.95,
  },
});
