import React, { useCallback } from 'react';
import {
  Pressable,
  PressableProps,
  ViewStyle,
  View,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeInUp,
  FadeOut,
  interpolate,
  useAnimatedScrollHandler,
  Easing,
} from 'react-native-reanimated';

export const SPRING_CONFIG = {
  stiffness: 400,
  damping: 20,
  mass: 0.5,
};

export const TAP_SPRING = {
  stiffness: 600,
  damping: 22,
  mass: 0.3,
};

// ── Press Scale Hook ──
export function usePressScale(scaleTo = 0.96) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pressIn = useCallback(() => {
    scale.value = withSpring(scaleTo, TAP_SPRING);
  }, [scale, scaleTo]);

  const pressOut = useCallback(() => {
    scale.value = withSpring(1, TAP_SPRING);
  }, [scale]);

  return { animatedStyle, pressIn, pressOut };
}

// ── Animated Pressable ──
interface AnimatedPressableProps extends PressableProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  scaleTo?: number;
}

export function AnimatedPressable({
  children,
  style,
  scaleTo = 0.96,
  onPress,
  ...props
}: AnimatedPressableProps) {
  const { animatedStyle, pressIn, pressOut } = usePressScale(scaleTo);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      {...props}
    >
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

// ── Button Press Scale (120ms) ──
export function useButtonPress() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pressIn = useCallback(() => {
    scale.value = withTiming(0.96, {
      duration: 60,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [scale]);

  const pressOut = useCallback(() => {
    scale.value = withTiming(1, {
      duration: 60,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [scale]);

  return { animatedStyle, pressIn, pressOut };
}

// ── Staggered Entrance ──
interface StaggerProps {
  children: React.ReactNode;
  delay?: number;
  index: number;
  style?: ViewStyle;
}

export function StaggerFadeIn({
  children,
  delay = 80,
  index,
  style,
}: StaggerProps) {
  return (
    <Animated.View
      entering={FadeInUp.delay(index * delay)
        .duration(400)
        .springify()
        .damping(20)
        .stiffness(200)}
      exiting={FadeOut.duration(200)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

// ── Parallax Scroll Hook ──
export function useParallaxScroll(speed = 0.7) {
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const illustrationStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -scrollX.value * (1 - speed) }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -scrollX.value * 0 }],
  }));

  return { scrollHandler, illustrationStyle, scrollX };
}

// ── Animated Tab Bar ──
interface TabConfig {
  key: string;
  icon: React.ReactNode;
  label: string;
}

interface AnimatedTabBarProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabPress: (key: string) => void;
  colors: {
    primary: string;
    textMuted: string;
    card: string;
    border: string;
  };
  theme: 'light' | 'dark';
}

export function AnimatedTabBar({
  tabs,
  activeTab,
  onTabPress,
  colors,
  theme,
}: AnimatedTabBarProps) {
  return (
    <View
      style={[
        styles.tabBar,
        { backgroundColor: colors.card, borderTopColor: colors.border },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            style={styles.tabItem}
            onPress={() => onTabPress(tab.key)}
          >
            <TabIcon isActive={isActive} color={colors.primary} mutedColor={colors.textMuted}>
              {tab.icon}
            </TabIcon>
            <AnimatedText
              style={[
                styles.tabLabel,
                {
                  color: isActive ? colors.primary : colors.textMuted,
                  fontFamily: isActive ? 'Poppins_600SemiBold' : 'Poppins_500Medium',
                },
              ]}
            >
              {tab.label}
            </AnimatedText>
          </Pressable>
        );
      })}
    </View>
  );
}

function TabIcon({
  children,
  isActive,
  color,
  mutedColor,
}: {
  children: React.ReactNode;
  isActive: boolean;
  color: string;
  mutedColor: string;
}) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withSpring(isActive ? 1.05 : 1, SPRING_CONFIG);
  }, [isActive, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<{ color?: string; size?: number }>, {
            color: isActive ? color : mutedColor,
            size: 20,
          })
        : children}
    </Animated.View>
  );
}

function AnimatedText({
  children,
  style,
}: {
  children: React.ReactNode;
  style: any;
}) {
  return <Animated.Text style={style}>{children}</Animated.Text>;
}

// ── Heart Pulse Animation ──
export function useHeartPulse() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const pulse = useCallback(() => {
    scale.value = withSequence(
      withTiming(1.3, { duration: 150 }),
      withTiming(1, { duration: 100 }),
      withTiming(1.15, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  }, [scale]);

  return { animatedStyle, pulse };
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    height: 76,
    borderTopWidth: 1,
    paddingBottom: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
  },
});
