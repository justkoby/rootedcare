import React, { useState, useMemo } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, StatusBar,
  useColorScheme, ScrollView, Pressable, TextInput,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import {
  Search as SearchIcon, LayoutGrid, List,
  Home as HomeIcon, Calendar, BookOpen, User, X,
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { herbs } from '../data/herbs';
import { HerbCard } from '../components/HerbCard';
import { AnimatedTabBar } from '../components/animations';

const TAB_CONFIG = [
  { key: 'home',     icon: <HomeIcon />,   label: 'Home'    },
  { key: 'explore',  icon: <SearchIcon />, label: 'Explore' },
  { key: 'my-care',  icon: <Calendar />,   label: 'My Care' },
  { key: 'learn',    icon: <BookOpen />,    label: 'Library' },
  { key: 'profile',  icon: <User />,       label: 'Profile' },
];

type ViewMode = 'grid' | 'list';

const CATEGORIES = [
  { id: 'all',           emoji: '🌿', label: 'All'           },
  { id: 'womens-health', emoji: '🌸', label: "Women's Health" },
  { id: 'digestion',     emoji: '🫀', label: 'Digestion'      },
  { id: 'immunity',      emoji: '🛡️', label: 'Immunity'       },
  { id: 'skin',          emoji: '✨', label: 'Skin'           },
  { id: 'sleep',         emoji: '💤', label: 'Sleep'          },
  { id: 'stress',        emoji: '🧘', label: 'Stress'         },
];

const SYMPTOM_MAP: Record<string, string[]> = {
  headache:   ['Headache', 'head', 'migraine'],
  digestion:  ['Digestion', 'Stomach', 'stomach', 'Bloating', 'bloat'],
  immunity:   ['Immunity', 'immune', 'Cold', 'cold', 'Flu'],
  skin:       ['Skin', 'acne', 'Skin Rash', 'rash'],
  sleep:      ['Sleep', 'insomnia', 'Difficulty Sleeping'],
  stress:     ['Stress', 'anxiety', 'Anxiety', 'Mental Health'],
};

export default function ExploreScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const filtered = useMemo(() => {
    let results = herbs;

    if (query.trim().length > 0) {
      const q = query.toLowerCase();
      results = herbs.filter(h =>
        h.name.toLowerCase().includes(q) ||
        h.scientificName.toLowerCase().includes(q) ||
        h.description.toLowerCase().includes(q) ||
        h.symptoms.some(s => s.toLowerCase().includes(q)) ||
        h.bestFor.some(b => b.toLowerCase().includes(q)) ||
        Object.values(h.localNames).some(n => n?.toLowerCase().includes(q))
      );
    }

    if (category !== 'all') {
      const catTokens = SYMPTOM_MAP[category] ?? [category];
      results = results.filter(h =>
        h.bestFor.some(b => catTokens.some(t => b.toLowerCase().includes(t.toLowerCase()))) ||
        h.symptoms.some(s => catTokens.some(t => s.toLowerCase().includes(t.toLowerCase())))
      );
    }

    return results;
  }, [query, category]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Explore Herbs</Text>
          <Pressable
            style={[styles.viewToggle, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid'
              ? <List size={20} color={colors.primary} />
              : <LayoutGrid size={20} color={colors.primary} />}
          </Pressable>
        </View>

        {/* Search bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SearchIcon size={18} color={colors.textMuted} />
          <TextInput
            placeholder="Search herbs, symptoms, conditions..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}><X size={16} color={colors.textMuted} /></Pressable>
          )}
        </View>

        {/* Symptom Checker shortcut */}
        <Pressable
          style={[styles.symptomBanner, { backgroundColor: colors.primary + '14', borderColor: colors.primary + '33' }]}
          onPress={() => router.push('/symptom-checker' as any)}
        >
          <Text style={{ fontSize: 20 }}>🩺</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.symptomBannerTitle, { color: colors.text }]}>Not sure which herb?</Text>
            <Text style={[styles.symptomBannerSub, { color: colors.textMuted }]}>Search by symptom →</Text>
          </View>
        </Pressable>

        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat.id}
              style={[
                styles.catChip,
                {
                  backgroundColor: category === cat.id ? colors.primary : colors.card,
                  borderColor: category === cat.id ? colors.primary : colors.border,
                }
              ]}
              onPress={() => setCategory(cat.id)}
            >
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text style={[styles.catLabel, { color: category === cat.id ? '#FFFFFF' : colors.textMuted }]}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Results count */}
        <View style={styles.resultsRow}>
          <Text style={[styles.resultsCount, { color: colors.textMuted }]}>
            {filtered.length} herb{filtered.length !== 1 ? 's' : ''} found
          </Text>
        </View>

        {/* Results */}
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌿</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No herbs found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              Try searching by symptom or browse categories.
            </Text>
            <Pressable
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/symptom-checker' as any)}
            >
              <Text style={styles.emptyBtnText}>Try Symptom Checker</Text>
            </Pressable>
          </View>
        ) : viewMode === 'grid' ? (
          <View style={styles.grid}>
            {filtered.map(herb => (
              <Pressable
                key={herb.id}
                style={styles.gridItem}
                onPress={() => router.push(`/herb/${herb.id}` as any)}
              >
                <HerbCard herb={herb} style={styles.gridCard} />
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filtered.map(herb => (
              <Pressable
                key={herb.id}
                style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/herb/${herb.id}` as any)}
              >
                <HerbCard herb={herb} compact />
              </Pressable>
            ))}
          </View>
        )}

      </ScrollView>

      {/* Bottom Tab Bar */}
      <AnimatedTabBar
        tabs={TAB_CONFIG}
        activeTab="explore"
        onTabPress={(key) => {
          const routes: Record<string, string> = {
            home: '/home',
            explore: '/explore',
            'my-care': '/my-care-plan',
            learn: '/learn',
            profile: '/profile',
          };
          if (routes[key] && key !== 'explore') {
            router.push(routes[key] as any);
          }
        }}
        colors={{
          primary: colors.primary,
          textMuted: colors.textMuted,
          card: colors.card,
          border: colors.border,
        }}
        theme={theme}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },
  title: { fontFamily: 'Poppins_600SemiBold', fontSize: 28, letterSpacing: -0.5 },
  viewToggle: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, gap: 10, marginBottom: 14 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, padding: 0 },
  symptomBanner: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  symptomBannerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 14 },
  symptomBannerSub: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 2 },
  catScroll: { paddingHorizontal: 24, paddingBottom: 16, gap: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  catEmoji: { fontSize: 15 },
  catLabel: { fontFamily: 'Poppins_500Medium', fontSize: 13 },
  resultsRow: { paddingHorizontal: 24, marginBottom: 12 },
  resultsCount: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  gridItem: { width: '46%', flexGrow: 1 },
  gridCard: { width: '100%' },
  listContainer: { paddingHorizontal: 24, gap: 10 },
  listItem: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, marginBottom: 8 },
  emptySubtitle: { fontFamily: 'Inter_400Regular', fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  emptyBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  emptyBtnText: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#FFFFFF' },
});
