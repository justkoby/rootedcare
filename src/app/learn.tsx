import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, StatusBar,
  useColorScheme, ScrollView, Pressable, Image, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Home as HomeIcon, Search, Calendar, BookOpen, User, Clock } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { herbs } from '../data/herbs';
import { AnimatedTabBar } from '../components/animations';
import { getArticles } from '../services/articles';

const TAB_CONFIG = [
  { key: 'home',     icon: <HomeIcon />,   label: 'Home'    },
  { key: 'explore',  icon: <Search />,     label: 'Explore' },
  { key: 'my-care',  icon: <Calendar />,   label: 'My Care' },
  { key: 'learn',    icon: <BookOpen />,    label: 'Library' },
  { key: 'profile',  icon: <User />,       label: 'Profile' },
];

type Tab = 'All' | 'Herbs' | 'Wellness' | 'Cycle' | 'Nutrition';

// Commented out as requested:
// const ARTICLES = [
//   { id: '1', tag: 'FEATURED', title: 'The Power of Ginger: More Than Just a Spice', duration: '5 min read', herbId: 'ginger', featured: true },
//   { id: '2', tag: 'Wellness', title: 'Understanding Your Menstrual Cycle', duration: '4 min read', herbId: 'hibiscus' },
//   { id: '3', tag: 'Herbs', title: 'Boost Immunity Naturally with Moringa', duration: '6 min read', herbId: 'moringa' },
//   { id: '4', tag: 'Nutrition', title: 'Herbal Teas You Should Drink Daily', duration: '3 min read', herbId: 'prekese' },
//   { id: '5', tag: 'Cycle', title: 'Natural Support for Every Phase', duration: '7 min read', herbId: 'neem' },
// ];

export default function LearnScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const [activeTab, setActiveTab] = useState<Tab>('All');

  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadArticles() {
      try {
        const data = await getArticles();
        setArticles(data);
      } catch (err) {
        console.error(err);
        setError('Unable to load articles.');
      } finally {
        setLoading(false);
      }
    }
    loadArticles();
  }, []);

  const tabs: Tab[] = ['All', 'Herbs', 'Wellness', 'Cycle', 'Nutrition'];

  const filtered = activeTab === 'All'
    ? articles
    : articles.filter(a => a.tag === activeTab || (activeTab === 'Herbs' && a.tag === 'Herbs'));

  const featured = articles.find(a => a.featured) || articles[0];
  const rest = featured ? articles.filter(a => a.id !== featured.id) : articles;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Learn</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Grow your knowledge.</Text>
        </View>

        {/* Category tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {tabs.map(t => (
            <Pressable
              key={t}
              style={[styles.tabPill, { backgroundColor: activeTab === t ? colors.primary : colors.card, borderColor: activeTab === t ? colors.primary : colors.border }]}
              onPress={() => setActiveTab(t)}
            >
              <Text style={[styles.tabPillLabel, { color: activeTab === t ? '#FFFFFF' : colors.textMuted }]}>{t}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.textMuted, marginTop: 12 }}>Loading articles...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerLoading}>
            <Text style={{ color: '#EF4444', textAlign: 'center' }}>{error}</Text>
          </View>
        ) : articles.length === 0 ? (
          <View style={styles.centerLoading}>
            <Text style={{ color: colors.textMuted }}>No articles available yet.</Text>
          </View>
        ) : (
          <>
            {/* Featured article */}
            {featured && activeTab === 'All' && (() => {
              const herb = herbs.find(h => h.id === featured.herbId);
              const imageSource = featured.image_url ? { uri: featured.image_url } : (herb?.image || require('../assets/herbs/ginger.png'));
              return (
                <Pressable
                  style={[styles.featuredCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push(`/articles/${featured.slug}` as any)}
                >
                  <Image source={imageSource} style={styles.featuredImg} />
                  <View style={styles.featuredOverlay}>
                    <View style={[styles.tagBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.tagBadgeText}>FEATURED</Text>
                    </View>
                    <Text style={styles.featuredTitle}>{featured.title}</Text>
                    <View style={styles.durationRow}>
                      <Clock size={13} color="rgba(255,255,255,0.8)" />
                      <Text style={styles.featuredDuration}>{featured.read_time ?? featured.reading_time ?? featured.duration} min read</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })()}

            {/* Article list */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {activeTab === 'All' ? 'Latest Articles' : activeTab}
              </Text>
              {(activeTab === 'All' ? rest : filtered).map(article => {
                const herb = herbs.find(h => h.id === article.herbId);
                const imageSource = article.image_url ? { uri: article.image_url } : (herb?.image || require('../assets/herbs/ginger.png'));
                const readTime = article.read_time ?? article.reading_time ?? article.duration;
                return (
                  <Pressable
                    key={article.id}
                    style={[styles.articleCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => router.push(`/articles/${article.slug}` as any)}
                  >
                    <Image source={imageSource} style={styles.articleThumb} />
                    <View style={styles.articleContent}>
                      <View style={[styles.articleTagBadge, { backgroundColor: colors.border }]}>
                        <Text style={[styles.articleTag, { color: colors.primary }]}>{article.tag}</Text>
                      </View>
                      <Text style={[styles.articleTitle, { color: colors.text }]}>{article.title}</Text>
                      <View style={styles.durationRow}>
                        <Clock size={13} color={colors.textMuted} />
                        <Text style={[styles.articleDuration, { color: colors.textMuted }]}>{readTime} min read</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

      </ScrollView>

      {/* Bottom Tab Bar */}
      <AnimatedTabBar
        tabs={TAB_CONFIG}
        activeTab="learn"
        onTabPress={(key) => {
          const routes: Record<string, string> = {
            home: '/home',
            explore: '/explore',
            'my-care': '/my-care',
            learn: '/learn',
            profile: '/profile',
          };
          if (routes[key] && key !== 'learn') {
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
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },
  title: { fontFamily: 'Poppins_600SemiBold', fontSize: 28, letterSpacing: -0.5 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 15, marginTop: 2 },
  tabsScroll: { paddingHorizontal: 24, paddingBottom: 16, gap: 8 },
  tabPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  tabPillLabel: { fontFamily: 'Poppins_500Medium', fontSize: 13 },
  featuredCard: { marginHorizontal: 24, borderRadius: 24, overflow: 'hidden', borderWidth: 1, marginBottom: 24, height: 220 },
  featuredImg: { width: '100%', height: '100%', position: 'absolute' },
  featuredOverlay: { flex: 1, justifyContent: 'flex-end', padding: 20, backgroundColor: 'rgba(0,0,0,0.4)' },
  tagBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  tagBadgeText: { fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: '#FFFFFF', letterSpacing: 0.5 },
  featuredTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#FFFFFF', marginBottom: 8, lineHeight: 24 },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  featuredDuration: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  section: { paddingHorizontal: 24 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, marginBottom: 14 },
  articleCard: { flexDirection: 'row', padding: 14, borderRadius: 20, borderWidth: 1, marginBottom: 12, alignItems: 'center' },
  articleThumb: { width: 70, height: 70, borderRadius: 14, marginRight: 14 },
  articleContent: { flex: 1 },
  articleTagBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 6 },
  articleTag: { fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
  articleTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, lineHeight: 20, marginBottom: 6 },
  articleDuration: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  centerLoading: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
});
