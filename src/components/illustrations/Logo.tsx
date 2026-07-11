import React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';

interface LogoProps {
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ size = 80 }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        <LinearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={colors.secondary} />
          <Stop offset="100%" stopColor={colors.primary} />
        </LinearGradient>
      </Defs>
      {/* Outer Glow Circle */}
      <Circle cx="50" cy="50" r="44" stroke={colors.border} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      {/* Sun/Core motif */}
      <Circle cx="50" cy="50" r="28" fill="url(#logoGrad)" opacity="0.15" />
      {/* Calming Sun rays / leaf vector */}
      <Path
        d="M50 15C30.67 15 15 30.67 15 50C15 76.67 50 85 50 85C50 85 85 76.67 85 50C85 30.67 69.33 15 50 15Z"
        stroke={colors.primary}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner Leaf Vein */}
      <Path
        d="M50 25C50 25 50 55 50 75"
        stroke={colors.primary}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Side veins representing balance and wellness */}
      <Path
        d="M50 40C56 36 62 38 66 42"
        stroke={colors.primary}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <Path
        d="M50 48C44 44 38 46 34 50"
        stroke={colors.primary}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <Path
        d="M50 55C56 51 62 53 66 57"
        stroke={colors.primary}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </Svg>
  );
};
export default Logo;
