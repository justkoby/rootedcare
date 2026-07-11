import React, { useState } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, StatusBar,
  useColorScheme, ScrollView, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Leaf } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuthStore } from '../store/useAuthStore';

const INTERESTS = [
  { id: 'digestion',     emoji: '🌿', label: "Digestion"         },
  { id: 'womens-health', emoji: '🌸', label: "Women's Health"    },
  { id: 'immunity',      emoji: '🛡️', label: "Immunity"          },
  { id: 'stress',        emoji: '🧘', label: "Stress & Anxiety"  },
  { id: 'sleep',         emoji: '💤', label: "Sleep"             },
  { id: 'nutrition',     emoji: '🥗', label: "Nutrition"         },
  { id: 'skin',          emoji: '✨', label: "Skin Care"         },
  { id: 'diabetes',      emoji: '💉', label: "Diabetes Support"  },
  { id: 'bp',            emoji: '❤️', label: "Blood Pressure"   },
  { id: 'energy',        emoji: '⚡', label: "Energy & Fitness"  },
  { id: 'muscles',       emoji: '💪', label: "Muscle Recovery"   },
  { id: 'detox',         emoji: '🫧', label: "Detox & Cleansing" },
];

export default function InterestsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const setInterests = useAuthStore((s) => s.setInterests);
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    setInterests(selected);
    completeOnboarding();
    router.replace('/home' as any);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconBadge, { backgroundColor: colors.primary + '22' }]}>
            <Leaf size={28} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Let’s personalise {'\n'}your experience 🌿
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            What would you like help with?{'\n'}Select all that apply.
          </Text>
        </View>

        {/* Interest chips grid */}
        <View style={styles.grid}>
          {INTERESTS.map(item => {
            const isSelected = selected.includes(item.id);
            return (
              <Pressable
                key={item.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                    shadowColor: isSelected ? colors.primary : 'transparent',
                  }
                ]}
                onPress={() => toggle(item.id)}
              >
                <Text style={styles.chipEmoji}>{item.emoji}</Text>
                <Text style={[
                  styles.chipLabel,
                  { color: isSelected ? '#FFFFFF' : colors.text }
                ]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Selection count */}
        {selected.length > 0 && (
          <Text style={[styles.selectionNote, { color: colors.textMuted }]}>
            {selected.length} interest{selected.length > 1 ? 's' : ''} selected
          </Text>
        )}

        {/* Continue button */}
        <Pressable
          style={[
            styles.continueBtn,
            {
              backgroundColor: selected.length > 0 ? colors.primary : colors.border,
            }
          ]}
          onPress={handleContinue}
          disabled={selected.length === 0}
        >
          <Text style={[styles.continueBtnText, { opacity: selected.length > 0 ? 1 : 0.5 }]}>
            Continue →
          </Text>
        </Pressable>

        <Pressable onPress={handleContinue} style={styles.skipBtn}>
          <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip for now</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 48 },
  header: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 48, paddingBottom: 32 },
  iconBadge: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 28, textAlign: 'center', lineHeight: 38, marginBottom: 12 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 16, textAlign: 'center', lineHeight: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12, justifyContent: 'center', marginBottom: 20 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 50, borderWidth: 1.5,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3,
  },
  chipEmoji: { fontSize: 16 },
  chipLabel: { fontFamily: 'Poppins_500Medium', fontSize: 14 },
  selectionNote: { fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center', marginBottom: 16 },
  continueBtn: {
    marginHorizontal: 24, borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', marginBottom: 12,
  },
  continueBtnText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FFFFFF' },
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipText: { fontFamily: 'Inter_400Regular', fontSize: 14 },
});
