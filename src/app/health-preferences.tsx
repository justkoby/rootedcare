import React from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, StatusBar,
  useColorScheme, Pressable, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Heart, Bell, Shield, Leaf, Activity } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuthStore } from '../store/useAuthStore';

const ALL_INTERESTS = [
  { id: 'digestion', label: 'Digestion', icon: '🫀' },
  { id: 'immunity', label: 'Immunity', icon: '🛡️' },
  { id: 'womens-health', label: "Women's Health", icon: '🌸' },
  { id: 'skin', label: 'Skin Care', icon: '✨' },
  { id: 'sleep', label: 'Sleep', icon: '💤' },
  { id: 'stress', label: 'Stress & Anxiety', icon: '🧘' },
  { id: 'energy', label: 'Energy', icon: '⚡' },
  { id: 'detox', label: 'Detox', icon: '🌿' },
  { id: 'heart', label: 'Heart Health', icon: '💚' },
  { id: 'respiratory', label: 'Respiratory', icon: '🌬️' },
  { id: 'pregnancy', label: 'Pregnancy Care', icon: '🤰' },
  { id: 'children', label: "Children's Health", icon: '👶' },
];

export default function HealthPreferencesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const interests = useAuthStore((s) => s.interests);
  const setInterests = useAuthStore((s) => s.setInterests);

  const toggle = (id: string) => {
    if (interests.includes(id)) {
      setInterests(interests.filter((i) => i !== id));
    } else {
      setInterests([...interests, id]);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Health Preferences</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.description, { color: colors.textMuted }]}>
          Select the wellness areas you care about. This helps us personalise your herb recommendations.
        </Text>

        <View style={styles.grid}>
          {ALL_INTERESTS.map((item) => {
            const selected = interests.includes(item.id);
            return (
              <Pressable
                key={item.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? colors.primary : colors.card,
                    borderColor: selected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => toggle(item.id)}
              >
                <Text style={styles.chipEmoji}>{item.icon}</Text>
                <Text
                  style={[
                    styles.chipLabel,
                    { color: selected ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontFamily: 'Poppins_600SemiBold', fontSize: 18 },
  content: { padding: 24 },
  description: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 22, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, borderWidth: 1.5,
  },
  chipEmoji: { fontSize: 18 },
  chipLabel: { fontFamily: 'Poppins_500Medium', fontSize: 14 },
});
