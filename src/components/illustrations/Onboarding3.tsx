import React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G, Rect } from 'react-native-svg';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';

export const Onboarding3: React.FC = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  return (
    <Svg width="100%" height="240" viewBox="0 0 300 240" fill="none">
      <Defs>
        <LinearGradient id="bgGrad3" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.1" />
          <Stop offset="100%" stopColor={colors.secondary} stopOpacity="0.01" />
        </LinearGradient>
        <LinearGradient id="handSkinGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#A05C3C" />
          <Stop offset="100%" stopColor="#552B18" />
        </LinearGradient>
        <LinearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#F9F6F1" />
        </LinearGradient>
      </Defs>

      {/* Ambient background shape */}
      <Circle cx="150" cy="120" r="95" fill="url(#bgGrad3)" />

      {/* TROPICAL FOLIAGE IN BACKGROUND */}
      <G id="bg-foliage">
        {/* Large back leaf */}
        <Path d="M40 180C50 110 100 90 120 100C125 120 90 190 40 180Z" fill={colors.accent} opacity="0.6" />
        {/* Lighter leaf */}
        <Path d="M260 180C250 110 200 90 180 100C175 120 210 190 260 180Z" fill="#82A272" opacity="0.6" />
      </G>

      {/* PHONE CONTAINER CONTAINER */}
      <G id="phone-container" transform="translate(105, 40)">
        {/* Outer Phone Bezel */}
        <Rect x="0" y="0" width="90" height="160" rx="16" fill="#2B2B2B" />
        {/* Phone Screen */}
        <Rect x="4" y="4" width="82" height="152" rx="12" fill="url(#screenGrad)" />
        {/* Speaker/Notch */}
        <Rect x="30" y="8" width="30" height="4" rx="2" fill="#2B2B2B" />
        
        {/* Chart inside Phone Screen */}
        {/* Chart circle backdrop */}
        <Circle cx="45" cy="55" r="24" fill="#EDEAE5" />
        {/* Calming wellness progress ring (Accented Natural Green) */}
        <Circle cx="45" cy="55" r="24" fill="none" stroke={colors.accent} strokeWidth="6" strokeDasharray="110 40" strokeLinecap="round" transform="rotate(-90 45 55)" />
        
        {/* Chart value text indicator */}
        <Circle cx="45" cy="55" r="16" fill="#FFFFFF" />
        <Rect x="38" y="52" width="14" height="6" rx="2" fill={colors.primary} />
        
        {/* Small content list mocks on screen */}
        <Rect x="12" y="94" width="66" height="12" rx="4" fill="#EAE5DE" />
        <Rect x="20" y="98" width="30" height="4" rx="2" fill={colors.textMuted} opacity="0.6" />
        <Rect x="64" y="98" width="8" height="4" rx="2" fill={colors.accent} />

        <Rect x="12" y="112" width="66" height="12" rx="4" fill="#EAE5DE" />
        <Rect x="20" y="116" width="40" height="4" rx="2" fill={colors.textMuted} opacity="0.6" />
        <Rect x="64" y="116" width="8" height="4" rx="2" fill={colors.accent} />

        <Rect x="12" y="130" width="66" height="12" rx="4" fill="#EAE5DE" />
        <Rect x="20" y="134" width="24" height="4" rx="2" fill={colors.textMuted} opacity="0.6" />
        <Rect x="64" y="134" width="8" height="4" rx="2" fill={colors.secondary} />
      </G>

      {/* PROFESSIONAL HAND HOLDING PHONE */}
      <G id="hand" transform="translate(60, 110)">
        {/* Arm / Sleeve */}
        <Path d="M0 130C30 115 65 110 80 120L70 130L0 130" fill={colors.primary} />
        {/* Golden wrist watch detail representing a professional */}
        <Rect x="66" y="114" width="10" height="8" rx="2" fill="#D79B63" transform="rotate(10 66 114)" />
        <Circle cx="71" cy="118" r="3" fill="#FFFFFF" />
        
        {/* Hand Skin */}
        <Path
          d="M80 120C90 115 115 95 125 90C132 87 136 93 130 98C120 108 105 120 100 125"
          fill="url(#handSkinGrad)"
        />
        {/* Fingers wrapping around phone */}
        {/* Thumb */}
        <Path d="M98 90C98 90 94 76 102 78C110 80 108 92 108 92" fill="url(#handSkinGrad)" />
        {/* Finger folds */}
        <Path d="M125 90C128 88 131 92 128 95" stroke="#4A2E1B" strokeWidth="1" />
        <Path d="M120 95C123 93 126 97 123 100" stroke="#4A2E1B" strokeWidth="1" />
      </G>

      {/* FOREGROUND LEAVES (Adding depth) */}
      <Path
        d="M200 220C210 180 230 160 250 160C260 160 250 190 235 220"
        fill={colors.accent}
        opacity="0.95"
      />
      <Path
        d="M50 220C60 190 80 175 90 180C95 185 85 205 70 220"
        fill={colors.accent}
        opacity="0.85"
      />
    </Svg>
  );
};
export default Onboarding3;
