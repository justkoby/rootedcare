import React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G, Rect } from 'react-native-svg';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';

export const Onboarding1: React.FC = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  return (
    <Svg width="100%" height="240" viewBox="0 0 300 240" fill="none">
      <Defs>
        <LinearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={colors.secondary} stopOpacity="0.1" />
          <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.02" />
        </LinearGradient>
        <LinearGradient id="skinGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#8B4A2B" />
          <Stop offset="100%" stopColor="#4A2E1B" />
        </LinearGradient>
        <LinearGradient id="headwrapGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#D79B63" />
          <Stop offset="100%" stopColor="#C67D43" />
        </LinearGradient>
      </Defs>

      {/* Ambient background shape */}
      <Circle cx="150" cy="120" r="100" fill="url(#bgGrad)" />
      
      {/* BACKGROUND LEAVES (Moringa/Neem style) */}
      {/* Left green leaf */}
      <Path
        d="M60 160C60 110 100 80 110 100C120 120 90 170 60 160Z"
        fill={colors.accent}
        opacity="0.8"
      />
      {/* Right terracotta leaf */}
      <Path
        d="M240 160C240 110 200 80 190 100C180 120 210 170 240 160Z"
        fill={colors.secondary}
        opacity="0.7"
      />

      {/* WOMAN FIGURE */}
      <G id="woman">
        {/* Shoulders / Torso */}
        <Path
          d="M100 220C100 190 120 175 150 175C180 175 200 190 200 220"
          fill="url(#skinGrad)"
        />
        {/* African Necklace Detail */}
        <Path
          d="M125 178C125 195 175 195 175 178"
          stroke="#D79B63"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Neck */}
        <Rect x="138" y="145" width="24" height="35" rx="10" fill="url(#skinGrad)" />

        {/* Head */}
        <Circle cx="150" cy="125" r="26" fill="url(#skinGrad)" />

        {/* Traditional Headwrap (Gele/Duku style) */}
        <Path
          d="M125 110C120 90 130 75 150 75C170 75 180 90 175 110C182 105 185 92 180 85C170 70 130 70 120 85C115 92 118 105 125 110Z"
          fill="url(#headwrapGrad)"
        />
        {/* Headwrap folds/lines */}
        <Path
          d="M130 95C140 85 160 85 170 95"
          stroke="#F9F6F1"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
        />
        <Path
          d="M124 88C138 78 162 78 176 88"
          stroke="#F9F6F1"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Closed Eyes (Mindful/Calm look) */}
        <Path
          d="M138 126C140 128 144 128 146 126"
          stroke="#F9F6F1"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.3"
        />
        <Path
          d="M154 126C156 128 160 128 162 126"
          stroke="#F9F6F1"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.3"
        />
        
        {/* Subtle Smile */}
        <Path
          d="M145 138C148 140 152 140 155 138"
          stroke="#F9F6F1"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* Golden Hoop Earring */}
        <Circle cx="123" cy="132" r="8" stroke="#D79B63" strokeWidth="2.5" fill="none" />
        <Circle cx="177" cy="132" r="8" stroke="#D79B63" strokeWidth="2.5" fill="none" />
      </G>

      {/* FOREGROUND LEAVES (Surrounding the woman) */}
      {/* Front-left tropical leaf */}
      <Path
        d="M80 220C85 190 100 170 115 170C125 170 120 200 110 220"
        fill={colors.accent}
      />
      {/* Front-right palm leaf style */}
      <Path
        d="M220 220C215 190 200 170 185 170C175 170 180 200 190 220"
        fill={colors.accent}
        opacity="0.9"
      />
      {/* Stem lines in leaves */}
      <Path d="M100 190C102 180 106 172 110 170" stroke={colors.background} strokeWidth="1" opacity="0.5" />
      <Path d="M200 190C198 180 194 172 190 170" stroke={colors.background} strokeWidth="1" opacity="0.5" />
    </Svg>
  );
};
export default Onboarding1;
