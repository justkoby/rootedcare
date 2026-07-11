import React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G, Rect } from 'react-native-svg';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';

export const Onboarding2: React.FC = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  return (
    <Svg width="100%" height="240" viewBox="0 0 300 240" fill="none">
      <Defs>
        <LinearGradient id="bgGrad2" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={colors.accent} stopOpacity="0.12" />
          <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.02" />
        </LinearGradient>
        <LinearGradient id="flowerGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#D93D59" />
          <Stop offset="100%" stopColor="#8A182E" />
        </LinearGradient>
        <LinearGradient id="prekeseGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#8B4A2B" />
          <Stop offset="100%" stopColor="#552B18" />
        </LinearGradient>
      </Defs>

      {/* Background calming shape */}
      <Rect x="50" y="30" width="200" height="180" rx="90" fill="url(#bgGrad2)" />

      {/* 1. MORINGA STEM & LEAVES (Left Side, flowing up) */}
      <G id="moringa" opacity="0.95">
        <Path d="M110 200C100 150 90 90 95 60" stroke={colors.accent} strokeWidth="3" strokeLinecap="round" />
        {/* Leaflets */}
        <Circle cx="80" cy="90" r="10" fill={colors.accent} />
        <Circle cx="112" cy="85" r="9" fill={colors.accent} />
        <Circle cx="76" cy="120" r="11" fill={colors.accent} />
        <Circle cx="114" cy="115" r="10" fill={colors.accent} />
        <Circle cx="82" cy="150" r="12" fill={colors.accent} />
        <Circle cx="118" cy="145" r="11" fill={colors.accent} />
        <Circle cx="95" cy="54" r="9" fill={colors.accent} />
      </G>

      {/* 2. NEEM LEAVES (Right Side, flowing up) */}
      <G id="neem" opacity="0.9">
        <Path d="M190 200C200 150 210 90 205 60" stroke="#4D6B3E" strokeWidth="3" strokeLinecap="round" />
        {/* Pointed Neem leaflets with serrated look (simulated with polygon/paths) */}
        <Path d="M205 60C215 50 225 52 230 60C220 68 210 65 205 60Z" fill="#4D6B3E" />
        <Path d="M190 60C180 50 170 52 165 60C175 68 185 65 190 60Z" fill="#4D6B3E" />
        <Path d="M208 90C220 80 230 82 235 90C225 98 215 95 208 90Z" fill="#4D6B3E" />
        <Path d="M188 90C176 80 166 82 161 90C171 98 181 95 188 90Z" fill="#4D6B3E" />
        <Path d="M210 125C225 115 235 117 240 125C230 133 220 130 210 125Z" fill="#4D6B3E" />
        <Path d="M185 125C170 115 160 117 155 125C165 133 175 130 185 125Z" fill="#4D6B3E" />
        <Path d="M205 50C205 40 208 30 205 25C202 30 205 40 205 50Z" fill="#4D6B3E" />
      </G>

      {/* 3. PREKESE PODS (Center bottom, lying flat/diagonal) */}
      <G id="prekese">
        {/* Main Pod 1 */}
        <Path
          d="M110 180C110 180 120 140 165 130C175 128 185 132 188 138C190 145 185 152 175 155C140 165 125 190 125 190L110 180Z"
          fill="url(#prekeseGrad)"
        />
        {/* Ridges on Prekese Pod */}
        <Path
          d="M125 162C135 150 152 145 168 143"
          stroke="#D79B63"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.6"
        />
        <Path
          d="M128 172C138 160 155 155 171 153"
          stroke="#D79B63"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
        />
      </G>

      {/* 4. HIBISCUS/SOBOLO FLOWER (Center top, blooming) */}
      <G id="hibiscus" transform="translate(115, 65)">
        {/* Flower Petals */}
        <Circle cx="35" cy="20" r="18" fill="url(#flowerGrad)" />
        <Circle cx="20" cy="35" r="18" fill="url(#flowerGrad)" />
        <Circle cx="50" cy="35" r="18" fill="url(#flowerGrad)" />
        <Circle cx="35" cy="50" r="18" fill="url(#flowerGrad)" />
        {/* Inner core */}
        <Circle cx="35" cy="35" r="10" fill="#F0A6B2" opacity="0.9" />
        {/* Stamen (the long yellow tip) */}
        <Path d="M35 35C35 35 48 20 54 16" stroke="#D79B63" strokeWidth="3" strokeLinecap="round" />
        <Circle cx="54" cy="16" r="3.5" fill="#E6C543" />
      </G>
    </Svg>
  );
};
export default Onboarding2;
