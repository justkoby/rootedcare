import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, StatusBar,
  useColorScheme, ScrollView, Pressable, Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Clock } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import { herbs } from '../../data/herbs';
import { getArticleById, Article } from '../../services/articleService';
import { HerbCard } from '../../components/HerbCard';

export default function ArticleDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    getArticleById(id as string).then(a => setArticle(a ?? null));
  }, [id]);

  if (!article) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Article not found</Text>
      </SafeAreaView>
    );
  }

  const relatedHerb = article.herbId ? herbs.find(h => h.id === article.herbId) : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={22} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }} />
        <View style={styles.tagBadge}>
          <Text style={[styles.tagText, { color: colors.primary }]}>{article.tag}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {relatedHerb && (
          <Animated.View entering={FadeInUp.duration(400).springify()}>
            <Image source={relatedHerb.image} style={styles.heroImage} />
          </Animated.View>
        )}

        <View style={styles.contentWrap}>
          <Animated.View entering={FadeInUp.delay(100).duration(400).springify()}>
            <Text style={[styles.title, { color: colors.text }]}>{article.title}</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(180).duration(400).springify()} style={styles.metaRow}>
            <Clock size={14} color={colors.textMuted} />
            <Text style={[styles.meta, { color: colors.textMuted }]}>{article.duration}</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(260).duration(400).springify()}>
            <Text style={[styles.subtitle, { color: colors.secondary }]}>{article.subtitle}</Text>
          </Animated.View>

          {article.content.map((paragraph, i) => (
            <Animated.View
              key={i}
              entering={FadeInUp.delay(340 + i * 80).duration(400).springify()}
            >
              <Text style={[styles.body, { color: colors.text }]}>{paragraph}</Text>
            </Animated.View>
          ))}

          {relatedHerb && (
            <Animated.View
              entering={FadeInUp.delay(340 + article.content.length * 80).duration(400).springify()}
              style={styles.relatedSection}
            >
              <Text style={[styles.relatedTitle, { color: colors.text }]}>Related Herb</Text>
              <HerbCard
                herb={relatedHerb}
                onPress={() => router.push(`/herb/${relatedHerb.id}` as any)}
              />
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorText: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, marginBottom: 20 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  tagBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
  scrollContent: { paddingBottom: 60 },
  heroImage: { width: '100%', height: 200 },
  contentWrap: { paddingHorizontal: 24, paddingTop: 24 },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 26, lineHeight: 34, letterSpacing: -0.5, marginBottom: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  meta: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  subtitle: { fontFamily: 'Poppins_500Medium', fontSize: 16, lineHeight: 24, marginBottom: 24 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 28, marginBottom: 20 },
  relatedSection: { marginTop: 16, marginBottom: 40 },
  relatedTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, marginBottom: 12 },
});
