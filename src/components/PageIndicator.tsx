import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';

interface PageIndicatorProps {
  count: number;
  activeIndex: number;
}

function AnimatedDot({ isActive, color, borderColor }: { isActive: boolean; color: string; borderColor: string }) {
  const width = useSharedValue(isActive ? 24 : 8);

  React.useEffect(() => {
    width.value = withSpring(isActive ? 24 : 8, {
      stiffness: 300,
      damping: 25,
      mass: 0.5,
    });
  }, [isActive, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: isActive ? color : borderColor },
        animatedStyle,
      ]}
    />
  );
}

export const PageIndicator: React.FC<PageIndicatorProps> = ({ count, activeIndex }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  return (
    <View style={styles.container} accessibilityRole="image" accessibilityLabel={`Step ${activeIndex + 1} of ${count}`}>
      {Array.from({ length: count }).map((_, index) => (
        <AnimatedDot
          key={index}
          isActive={index === activeIndex}
          color={colors.primary}
          borderColor={colors.border}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
