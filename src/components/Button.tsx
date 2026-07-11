import React from 'react';
import { StyleSheet, Text, ViewStyle, TextStyle, ActivityIndicator, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'text';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.96, {
      duration: 60,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 60,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  };

  const getButtonStyles = (): ViewStyle[] => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      opacity: disabled || loading ? 0.6 : 1,
    };

    if (variant === 'primary') {
      return [
        baseStyle,
        {
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
        },
        styles.primaryShadow,
        style || {},
      ];
    }

    if (variant === 'secondary') {
      return [
        baseStyle,
        {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: colors.primary,
        },
        style || {},
      ];
    }

    return [
      styles.textButton,
      style || {},
    ];
  };

  const getTextStyle = (): TextStyle[] => {
    if (variant === 'primary') {
      return [styles.text, { color: colorScheme === 'dark' ? '#141210' : '#F9F6F1' }, textStyle || {}];
    }
    if (variant === 'secondary') {
      return [styles.text, { color: colors.primary }, textStyle || {}];
    }
    return [styles.textLink, { color: colors.textMuted }, textStyle || {}];
  };

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={disabled || loading ? undefined : handlePressIn}
      onPressOut={disabled || loading ? undefined : handlePressOut}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={title}
    >
      <Animated.View style={[...getButtonStyles(), animatedStyle]}>
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : colors.primary} />
        ) : (
          <>
            <Text style={getTextStyle()}>{title}</Text>
            {icon && !loading && icon}
          </>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    gap: 8,
  },
  primaryShadow: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  textButton: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
  },
  textLink: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
  },
});
