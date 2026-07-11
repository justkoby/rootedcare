import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Clock } from 'lucide-react-native';
import { getArticleBySlug } from '../services/articles';
import { Colors } from '../constants/Colors';
import { herbs } from '../data/herbs';

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  short_description?: string | null;
  summary?: string | null;
  content?: string | null;
  body?: string | null;
  image_url?: string | null;
  cover_image_url?: string | null;
  category?: string | null;
  read_time?: string | number | null;
  reading_time?: string | number | null;
  author?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  herbId?: string | null;
};

export default function ArticleDetails() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadArticle() {
      if (!slug) {
        setError('Article not found.');
        setLoading(false);
        return;
      }

      try {
        const data = await getArticleBySlug(String(slug));

        if (!data) {
          setError('Article not found.');
        } else {
          setArticle(data);
        }
      } catch (err) {
        console.error('Article details error:', err);
        setError('Unable to load this article.');
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
  }, [slug]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading article...</Text>
      </SafeAreaView>
    );
  }

  if (error || !article) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: '#EF4444' }]}>{error || 'Article not found.'}</Text>
        <Pressable onPress={() => router.back()} style={[styles.backBtnAction, { backgroundColor: colors.primary }]}>
          <Text style={styles.backBtnActionText}>← Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const image = article.image_url ?? article.cover_image_url;
  const description = article.excerpt ?? article.short_description ?? article.summary;
  const content = article.content ?? article.body;
  const readTime = article.read_time ?? article.reading_time;

  // Fallback to local herb image if cover_image_url is null
  const relatedHerb = article.herbId ? herbs.find(h => h.id === article.herbId) : null;
  const imageSource = image ? { uri: image } : (relatedHerb?.image || require('../assets/herbs/ginger.png'));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        <Image source={imageSource} style={styles.heroImage} resizeMode="cover" />

        <View style={styles.contentContainer}>
          <Pressable onPress={() => router.back()} style={[styles.backTextLink, { borderColor: colors.border }]}>
            <ChevronLeft size={16} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>Back to articles</Text>
          </Pressable>

          {article.category ? (
            <View style={[styles.tagBadge, { backgroundColor: colors.border }]}>
              <Text style={[styles.tagText, { color: colors.primary }]}>{article.category.toUpperCase()}</Text>
            </View>
          ) : null}

          <Text style={[styles.title, { color: colors.text }]}>{article.title}</Text>

          <View style={styles.metaRow}>
            {article.author ? (
              <Text style={[styles.metaText, { color: colors.textMuted }]}>By {article.author}</Text>
            ) : null}
            {article.author && readTime ? (
              <Text style={{ color: colors.border }}>•</Text>
            ) : null}
            {readTime ? (
              <View style={styles.durationRow}>
                <Clock size={13} color={colors.textMuted} />
                <Text style={[styles.metaText, { color: colors.textMuted }]}>{readTime} min read</Text>
              </View>
            ) : null}
          </View>

          {description ? (
            <Text style={[styles.descriptionText, { color: colors.text }]}>{description}</Text>
          ) : null}

          {content ? (
            <Text style={[styles.bodyText, { color: colors.text }]}>{content}</Text>
          ) : (
            <Text style={[styles.bodyText, { color: colors.textMuted, fontStyle: 'italic' }]}>
              No article content has been added yet.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 16, fontFamily: 'System' },
  errorText: { fontSize: 18, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
  backBtnAction: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  backBtnActionText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  scrollContent: { paddingBottom: 40 },
  heroImage: { width: '100%', height: 260 },
  contentContainer: { padding: 24 },
  backTextLink: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 20, alignSelf: 'flex-start' },
  backText: { fontSize: 14, fontFamily: 'System', fontWeight: '600' },
  tagBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  tagText: { fontSize: 11, fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '700', lineHeight: 34, marginBottom: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  metaText: { fontSize: 13, fontFamily: 'System' },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  descriptionText: { fontSize: 17, lineHeight: 26, fontWeight: '500', marginBottom: 20, opacity: 0.95 },
  bodyText: { fontSize: 15, lineHeight: 26, fontFamily: 'System' },
});
