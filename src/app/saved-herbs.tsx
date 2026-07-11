import React from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, StatusBar,
  useColorScheme, Pressable, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Heart } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { herbs } from '../data/herbs';
import { useFavoriteStore } from '../store/useFavoriteStore';
import { HerbCard } from '../components/HerbCard';
import { AnimatedPressable } from '../components/animations';

export default function SavedHerbsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const favorites = useFavoriteStore((s) => s.favorites);
  const toggleFavorite = useFavoriteStore((s) => s.toggleFavorite);

  const savedHerbs = herbs.filter((h) => favorites.includes(h.id));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Saved Herbs</Text>
        <View style={{ width: 40 }} />
      </View>

      {savedHerbs.length === 0 ? (
        <View style={styles.empty}>
          <Heart size={48} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No saved herbs yet</Text>
          <Text style={[styles.emptySub, { color: colors.textMuted }]}>
            Tap the heart icon on any herb to save it here.
          </Text>
          <AnimatedPressable
            style={[styles.exploreBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/explore' as any)}
          >
            <Text style={styles.exploreBtnText}>Explore Herbs</Text>
          </AnimatedPressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {savedHerbs.map((herb, i) => (
            <Animated.View
              key={herb.id}
              entering={FadeInUp.delay(i * 60).duration(300).springify()}
              style={styles.gridItem}
            >
              <HerbCard
                herb={herb}
                onPress={() => router.push(`/herb/${herb.id}` as any)}
              />
            </Animated.View>
          ))}
        </ScrollView>
      )}
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
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, gap: 12 },
  emptyTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, marginTop: 8 },
  emptySub: { fontFamily: 'Inter_400Regular', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  exploreBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, marginTop: 8 },
  exploreBtnText: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#FFFFFF' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
  gridItem: { width: '46%', flexGrow: 1 },
});
