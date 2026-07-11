import React from 'react';
import {
  StyleSheet, Text, View, Image, useColorScheme, ViewStyle, Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { Herb } from '../data/herbs';

const TAP_SPRING = {
  stiffness: 600,
  damping: 22,
  mass: 0.3,
};

interface HerbCardProps {
  herb: Herb;
  compact?: boolean;
  style?: ViewStyle;
  onPress?: () => void;
}

export function HerbCard({ herb, compact = false, style, onPress }: HerbCardProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, TAP_SPRING);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, TAP_SPRING);
  };

  const card = compact ? (
    <View style={[styles.listCard, { backgroundColor: colors.card }, style]}>
      <Image source={herb.image} style={styles.listThumb} />
      <View style={styles.listContent}>
        <Text style={[styles.listName, { color: colors.text }]}>{herb.name}</Text>
        <Text style={[styles.listSci, { color: colors.textMuted }]}>{herb.scientificName}</Text>
        <Text style={[styles.listDesc, { color: colors.textMuted }]} numberOfLines={2}>
          {herb.description}
        </Text>
      </View>
    </View>
  ) : (
    <View style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
      <Image source={herb.image} style={styles.gridThumb} resizeMode="cover" />
      <View style={styles.gridContent}>
        <Text style={[styles.gridName, { color: colors.text }]} numberOfLines={1}>{herb.name}</Text>
        <Text style={[styles.gridSci, { color: colors.textMuted }]} numberOfLines={1}>{herb.scientificName}</Text>
        <View style={styles.bestForRow}>
          {herb.bestFor.slice(0, 2).map(tag => (
            <View key={tag} style={[styles.tag, { backgroundColor: colors.border }]}>
              <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={animatedStyle}>
          {card}
        </Animated.View>
      </Pressable>
    );
  }

  return card;
}

const styles = StyleSheet.create({
  gridCard: {
    borderRadius: 20, borderWidth: 1, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  gridThumb: { width: '100%', height: 130 },
  gridContent: { padding: 12 },
  gridName: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, marginBottom: 2 },
  gridSci: { fontFamily: 'Inter_400Regular', fontStyle: 'italic', fontSize: 11, marginBottom: 8 },
  bestForRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontFamily: 'Inter_500Medium', fontSize: 10 },
  listCard: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
  },
  listThumb: { width: 70, height: 70, borderRadius: 14, marginRight: 14 },
  listContent: { flex: 1 },
  listName: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, marginBottom: 2 },
  listSci: { fontFamily: 'Inter_400Regular', fontStyle: 'italic', fontSize: 12, marginBottom: 4 },
  listDesc: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18 },
});
