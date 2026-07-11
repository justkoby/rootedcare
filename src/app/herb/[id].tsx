import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, StatusBar,
  useColorScheme, Image, ScrollView, Pressable, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  withSpring,
  withSequence,
  withTiming,
  FadeInUp,
  FadeIn,
  SlideInRight,
} from 'react-native-reanimated';
import {
  ChevronLeft, Heart, Plus, Sparkles, CheckCircle, Info,
  Clock, AlertTriangle, ShieldCheck, FlaskConical, Globe,
  BookOpen, ChevronRight,
} from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { herbs as hardcodedHerbs, Herb } from '../../data/herbs';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button';
import { HerbCard } from '../../components/HerbCard';
import { useFavoriteStore } from '../../store/useFavoriteStore';

type TabType = 'overview' | 'benefits' | 'preparation' | 'safety';

const ANIMATION_DELAY = 80;

function StaggerSection({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <Animated.View
      entering={FadeInUp.delay(index * ANIMATION_DELAY)
        .duration(400)
        .springify()
        .damping(25)
        .stiffness(200)}
    >
      {children}
    </Animated.View>
  );
}

function HeartButton({ isFavorited, onPress }: { isFavorited: boolean; onPress: () => void }) {
  const scale = useSharedValue(1);

  const handlePress = useCallback(() => {
    scale.value = withSequence(
      withTiming(1.3, { duration: 150 }),
      withTiming(1, { duration: 100 }),
      withTiming(1.15, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    onPress();
  }, [onPress, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={handlePress} style={styles.headerBtn}>
      <Animated.View style={animatedStyle}>
        <Heart
          size={24}
          color={isFavorited ? '#E91E63' : '#FFFFFF'}
          fill={isFavorited ? '#E91E63' : 'transparent'}
        />
      </Animated.View>
    </Pressable>
  );
}

function toList(value: unknown): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.filter(Boolean).map(String);
  }

  if (typeof value === 'string') {
    return value
      .split(/\n|,|;/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

const emptyHerb: Herb = {
  id: '',
  name: '',
  scientificName: '',
  localNames: {},
  description: '',
  overview: '',
  activeCompounds: [],
  benefits: [],
  howToUse: [],
  preparation: [],
  dosage: '',
  precautions: [],
  sideEffects: [],
  drugInteractions: [],
  pregnancy: '',
  children: '',
  bestFor: [],
  whenToTake: '',
  symptoms: [],
  relatedHerbIds: [],
  sources: [],
  image: require('../../assets/herbs/ginger.png'),
};

export default function HerbDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // id is the slug
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const scrollY = useSharedValue(0);
  const favorites = useFavoriteStore((s) => s.favorites);
  const toggleFavorite = useFavoriteStore((s) => s.toggleFavorite);
  const isFavorited = favorites.includes(id as string);

  const [herb, setHerb] = useState<Herb | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchHerbDetails() {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('herbs')
        .select('*')
        .eq('slug', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching herb details:', error);
        setError('Unable to load details.');
      } else if (!data) {
        setError('Herb not found.');
      } else {
        console.log('HERB DATA:', data);
        const localHerb = hardcodedHerbs.find(lh => lh.id === data.slug) || emptyHerb;
        setHerb({
          ...localHerb,
          id: data.slug || data.id,
          name: data.common_name || data.name || localHerb?.name || '',
          scientificName: data.scientific_name || localHerb?.scientificName || '',
          description: data.description || data.summary || localHerb?.description || '',
          overview: data.description || data.summary || localHerb?.overview || '',
          bestFor: localHerb?.bestFor || [],
          symptoms: localHerb?.symptoms || [],
          localNames: localHerb?.localNames || {},
          image: data.image_url ? { uri: data.image_url } : (localHerb?.image || require('../../assets/herbs/ginger.png')),
          // Normalize dynamic fields using safe toList function
          benefits: toList(data.benefits ?? localHerb?.benefits),
          preparation: toList(data.preparation_methods ?? data.preparation ?? data.preparation_overview ?? localHerb?.preparation),
          precautions: toList(data.safety_notes ?? data.precautions ?? data.safety_summary ?? localHerb?.precautions),
        });
      }
      setLoading(false);
    }
    fetchHerbDetails();
  }, [id]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const heroStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, 150],
      [320, 200],
      'clamp'
    );
    const scale = interpolate(
      scrollY.value,
      [0, 150],
      [1, 0.85],
      'clamp'
    );
    return {
      height,
      transform: [{ scale }],
    };
  });

  const headerOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [50, 120],
      [1, 0],
      'clamp'
    );
    return { opacity };
  });

  const floatingHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [100, 180],
      [0, 1],
      'clamp'
    );
    return { opacity };
  });

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', gap: 15 }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textMuted }}>Loading herb details...</Text>
      </SafeAreaView>
    );
  }

  if (error || !herb) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', gap: 15 }]}>
        <Text style={[styles.errorText, { color: '#EF4444' }]}>{error || 'Herb not found'}</Text>
        <Button title="Go Back" variant="primary" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const relatedHerbs = hardcodedHerbs.filter(h => herb.relatedHerbIds?.includes(h.id));

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview',    label: 'Overview'    },
    { id: 'benefits',    label: 'Benefits'    },
    { id: 'preparation', label: 'Preparation' },
    { id: 'safety',      label: 'Safety'      },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Floating header (always visible) */}
      <Animated.View style={[styles.floatingHeader, headerOpacity]}>
        <Pressable style={styles.headerBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </Pressable>
        <HeartButton isFavorited={isFavorited} onPress={() => toggleFavorite(id as string)} />
      </Animated.View>

      {/* Compact header (shows on scroll) */}
      <Animated.View
        style={[
          styles.compactHeader,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
          floatingHeaderStyle,
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.compactBackBtn}>
          <ChevronLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.compactTitle, { color: colors.text }]} numberOfLines={1}>
          {herb.name}
        </Text>
        <Pressable onPress={() => toggleFavorite(id as string)} style={styles.compactBackBtn}>
          <Heart
            size={20}
            color={isFavorited ? '#E91E63' : colors.textMuted}
            fill={isFavorited ? '#E91E63' : 'transparent'}
          />
        </Pressable>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Hero image */}
        <Animated.View style={[styles.imageWrapper, heroStyle]}>
          <Image source={herb.image} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.imageOverlay} />
        </Animated.View>

        {/* Details card */}
        <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
          {/* Name + scientific name */}
          <StaggerSection index={0}>
            <Text style={[styles.name, { color: colors.text }]}>{herb.name}</Text>
            <Text style={styles.scientificName}>{herb.scientificName}</Text>
          </StaggerSection>

          {/* Local Names */}
          <StaggerSection index={1}>
            <View style={[styles.localNamesCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={styles.localNamesHeader}>
                <Globe size={15} color={colors.primary} />
                <Text style={[styles.localNamesTitle, { color: colors.text }]}>Local Names</Text>
              </View>
              <View style={styles.localNamesGrid}>
                {Object.entries(herb.localNames as Record<string, string>).map(([lang, name]) => (
                  <View key={lang} style={styles.localNameItem}>
                    <Text style={[styles.localNameLang, { color: colors.textMuted }]}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </Text>
                    <Text style={[styles.localNameValue, { color: colors.text }]}>{name || ''}</Text>
                  </View>
                ))}
              </View>
            </View>
          </StaggerSection>

          {/* Active Compounds */}
          <StaggerSection index={2}>
            <View style={styles.compoundsRow}>
              <FlaskConical size={15} color={colors.secondary} />
              <Text style={[styles.compoundsLabel, { color: colors.textMuted }]}>Active Compounds: </Text>
              <Text style={[styles.compoundsValue, { color: colors.text }]}>{herb.activeCompounds.join(' · ')}</Text>
            </View>
          </StaggerSection>

          {/* Dosage quick info */}
          <StaggerSection index={3}>
            <View style={[styles.dosageCard, { backgroundColor: colors.primary + '14', borderColor: colors.primary + '33' }]}>
              <Clock size={15} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.dosageTitle, { color: colors.primary }]}>Dosage & Timing</Text>
                <Text style={[styles.dosageText, { color: colors.text }]}>{herb.dosage}</Text>
                <Text style={[styles.dosageTiming, { color: colors.textMuted }]}>🕐 {herb.whenToTake}</Text>
              </View>
            </View>
          </StaggerSection>

          {/* Tabs */}
          <StaggerSection index={4}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
              <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
                {tabs.map(tab => {
                  const isActive = activeTab === tab.id;
                  return (
                    <Pressable
                      key={tab.id}
                      style={[styles.tabItem, isActive && { borderBottomColor: colors.primary }]}
                      onPress={() => setActiveTab(tab.id)}
                    >
                      <Text style={[styles.tabLabel, { color: isActive ? colors.primary : colors.textMuted }, isActive && { fontFamily: 'Poppins_600SemiBold' }]}>
                        {tab.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </StaggerSection>

          {/* Tab content */}
          <Animated.View
            key={activeTab}
            entering={FadeInUp.duration(300).springify().damping(25)}
            style={styles.tabContent}
          >
            {activeTab === 'overview' && (
              <StaggerSection index={0}>
                <Text style={[styles.bodyText, { color: colors.text }]}>{herb.overview}</Text>
                <View style={styles.infoSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Best for</Text>
                  <View style={styles.badgeRow}>
                    {herb.bestFor.map((badge, i) => (
                      <View key={i} style={[styles.badge, { backgroundColor: colors.border }]}>
                        <Text style={[styles.badgeText, { color: colors.primary }]}>{badge}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </StaggerSection>
            )}

            {activeTab === 'benefits' && (
              <View style={styles.listContainer}>
                {herb.benefits.length > 0 ? (
                  herb.benefits.map((benefit, i) => (
                    <StaggerSection key={i} index={i}>
                      <View style={styles.listItem}>
                        <Sparkles size={16} color={colors.accent} style={styles.listIcon} />
                        <Text style={[styles.bodyText, { color: colors.text, flex: 1 }]}>{benefit}</Text>
                      </View>
                    </StaggerSection>
                  ))
                ) : (
                  <Text style={[styles.bodyText, { color: colors.textMuted, textAlign: 'center', marginTop: 24, fontStyle: 'italic' }]}>
                    No benefits have been added yet.
                  </Text>
                )}
              </View>
            )}

            {activeTab === 'preparation' && (
              <>
                {herb.preparation.length > 0 || herb.howToUse.length > 0 ? (
                  <>
                    {herb.preparation.length > 0 && (
                      <>
                        <StaggerSection index={0}>
                          <Text style={[styles.sectionTitle, { color: colors.text }]}>How to Prepare</Text>
                        </StaggerSection>
                        {herb.preparation.map((step, i) => (
                          <StaggerSection key={i} index={i + 1}>
                            <View style={styles.stepItem}>
                              <View style={[styles.stepNum, { backgroundColor: colors.primary }]}>
                                <Text style={styles.stepNumText}>{i + 1}</Text>
                              </View>
                              <Text style={[styles.bodyText, { color: colors.text, flex: 1 }]}>{step}</Text>
                            </View>
                          </StaggerSection>
                        ))}
                      </>
                    )}
                    {herb.howToUse.length > 0 && (
                      <>
                        <StaggerSection index={herb.preparation.length + 1}>
                          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Other Ways to Use</Text>
                        </StaggerSection>
                        {herb.howToUse.map((use, i) => (
                          <StaggerSection key={i} index={i + herb.preparation.length + 2}>
                            <View style={styles.listItem}>
                              <CheckCircle size={16} color={colors.primary} style={styles.listIcon} />
                              <Text style={[styles.bodyText, { color: colors.text, flex: 1 }]}>{use}</Text>
                            </View>
                          </StaggerSection>
                        ))}
                      </>
                    )}
                  </>
                ) : (
                  <Text style={[styles.bodyText, { color: colors.textMuted, textAlign: 'center', marginTop: 24, fontStyle: 'italic', paddingHorizontal: 24 }]}>
                    No preparation instructions have been added yet.
                  </Text>
                )}
              </>
            )}

            {activeTab === 'safety' && (
              <>
                {herb.precautions.length > 0 || herb.sideEffects.length > 0 || herb.drugInteractions.length > 0 || herb.pregnancy || herb.children ? (
                  <>
                    {herb.precautions.length > 0 && (
                      <>
                        <StaggerSection index={0}>
                          <Text style={[styles.sectionTitle, { color: colors.text }]}>Precautions</Text>
                        </StaggerSection>
                        {herb.precautions.map((item, i) => (
                          <StaggerSection key={i} index={i + 1}>
                            <View style={styles.listItem}>
                              <Info size={16} color={colors.warning} style={styles.listIcon} />
                              <Text style={[styles.bodyText, { color: colors.text, flex: 1 }]}>{item}</Text>
                            </View>
                          </StaggerSection>
                        ))}
                      </>
                    )}
                    {herb.sideEffects.length > 0 && (
                      <>
                        <StaggerSection index={herb.precautions.length + 1}>
                          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Side Effects</Text>
                        </StaggerSection>
                        {herb.sideEffects.map((item, i) => (
                          <StaggerSection key={i} index={i + herb.precautions.length + 2}>
                            <View style={styles.listItem}>
                              <AlertTriangle size={16} color={colors.warning} style={styles.listIcon} />
                              <Text style={[styles.bodyText, { color: colors.text, flex: 1 }]}>{item}</Text>
                            </View>
                          </StaggerSection>
                        ))}
                      </>
                    )}
                    {herb.drugInteractions.length > 0 && (
                      <>
                        <StaggerSection index={herb.precautions.length + herb.sideEffects.length + 2}>
                          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Drug Interactions</Text>
                        </StaggerSection>
                        {herb.drugInteractions.map((item, i) => (
                          <StaggerSection key={i} index={i + herb.precautions.length + herb.sideEffects.length + 3}>
                            <View style={styles.listItem}>
                              <AlertTriangle size={16} color="#E53935" style={styles.listIcon} />
                              <Text style={[styles.bodyText, { color: colors.text, flex: 1 }]}>{item}</Text>
                            </View>
                          </StaggerSection>
                        ))}
                      </>
                    )}
                    {herb.pregnancy ? (
                      <StaggerSection index={herb.precautions.length + herb.sideEffects.length + herb.drugInteractions.length + 3}>
                        <View style={[styles.safetyBlock, { backgroundColor: '#FFF3E0', borderColor: '#FFB74D44' }]}>
                          <Text style={styles.safetyBlockTitle}>🤰 Pregnancy & Breastfeeding</Text>
                          <Text style={[styles.bodyText, { color: '#5D4037' }]}>{herb.pregnancy}</Text>
                        </View>
                      </StaggerSection>
                    ) : null}
                    {herb.children ? (
                      <StaggerSection index={herb.precautions.length + herb.sideEffects.length + herb.drugInteractions.length + 4}>
                        <View style={[styles.safetyBlock, { backgroundColor: '#E8F5E9', borderColor: '#81C78444' }]}>
                          <Text style={styles.safetyBlockTitle}>👶 Children</Text>
                          <Text style={[styles.bodyText, { color: '#2E7D32' }]}>{herb.children}</Text>
                        </View>
                      </StaggerSection>
                    ) : null}
                  </>
                ) : (
                  <Text style={[styles.bodyText, { color: colors.textMuted, textAlign: 'center', marginTop: 24, fontStyle: 'italic', paddingHorizontal: 24 }]}>
                    No safety information has been added yet.
                  </Text>
                )}
                {herb.sources.length > 0 && (
                  <StaggerSection index={herb.precautions.length + herb.sideEffects.length + herb.drugInteractions.length + 5}>
                    <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Research Sources</Text>
                    {herb.sources.map((src, i) => (
                      <View key={i} style={[styles.sourceItem, { borderColor: colors.border }]}>
                        <BookOpen size={14} color={colors.textMuted} />
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={[styles.sourceTitle, { color: colors.text }]}>{src.title}</Text>
                          <Text style={[styles.sourceMeta, { color: colors.textMuted }]}>{src.author} · {src.year}</Text>
                        </View>
                      </View>
                    ))}
                  </StaggerSection>
                )}
              </>
            )}
          </Animated.View>

          {/* Related Herbs */}
          {relatedHerbs.length > 0 && (
            <StaggerSection index={5}>
              <View style={styles.relatedSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Related Herbs</Text>
                <Animated.ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12 }}
                  entering={SlideInRight.duration(400).springify()}
                >
                  {relatedHerbs.map(related => (
                    <Pressable
                      key={related.id}
                      style={{ width: 150 }}
                      onPress={() => router.push(`/herb/${related.id}` as any)}
                    >
                      <HerbCard herb={related} style={{ width: 150 }} />
                    </Pressable>
                  ))}
                </Animated.ScrollView>
              </View>
            </StaggerSection>
          )}
        </View>
      </Animated.ScrollView>

      {/* Sticky CTA */}
      <Animated.View
        style={[styles.stickyFooter, { backgroundColor: colors.card, borderTopColor: colors.border }]}
        entering={FadeInUp.delay(600).duration(400)}
      >
        <Button
          title="Add to My Care"
          variant="primary"
          onPress={() => router.push('/add-to-plan' as any)}
          style={styles.ctaButton}
          icon={<Plus size={18} color="#FFFFFF" />}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorText: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, marginBottom: 20 },
  floatingHeader: { position: 'absolute', top: 50, left: 24, right: 24, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  compactHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    height: 88, flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8,
    borderBottomWidth: 1, elevation: 4,
  },
  compactBackBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  compactTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 17, flex: 1, textAlign: 'center' },
  scrollContent: { paddingBottom: 110 },
  imageWrapper: { width: '100%', overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%' },
  imageOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.15)' },
  detailsCard: { marginTop: -32, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 32, minHeight: 500 },
  name: { fontFamily: 'Poppins_600SemiBold', fontSize: 28, letterSpacing: -0.5 },
  scientificName: { fontFamily: 'Inter_400Regular', fontStyle: 'italic', fontSize: 15, color: '#9E9E9E', marginTop: 2, marginBottom: 16 },
  localNamesCard: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 16 },
  localNamesHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  localNamesTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 14 },
  localNamesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  localNameItem: { minWidth: '44%' },
  localNameLang: { fontFamily: 'Inter_500Medium', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 },
  localNameValue: { fontFamily: 'Poppins_600SemiBold', fontSize: 15 },
  compoundsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 16, flexWrap: 'wrap' },
  compoundsLabel: { fontFamily: 'Inter_500Medium', fontSize: 13 },
  compoundsValue: { fontFamily: 'Inter_400Regular', fontSize: 13, flex: 1 },
  dosageCard: { borderRadius: 16, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  dosageTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, marginBottom: 4 },
  dosageText: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20, marginBottom: 4 },
  dosageTiming: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  tabScroll: { marginBottom: 0 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: 20 },
  tabItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabLabel: { fontFamily: 'Poppins_500Medium', fontSize: 14 },
  tabContent: { minHeight: 120, marginBottom: 28 },
  bodyText: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 24 },
  infoSection: { marginTop: 20 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, marginBottom: 12 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { fontFamily: 'Poppins_600SemiBold', fontSize: 13 },
  listContainer: { gap: 12 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  listIcon: { marginTop: 4 },
  stepItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 14 },
  stepNum: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  stepNumText: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#FFFFFF' },
  safetyBlock: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12, marginTop: 8 },
  safetyBlockTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, marginBottom: 8 },
  sourceItem: { flexDirection: 'row', alignItems: 'flex-start', borderTopWidth: 1, paddingTop: 10, marginBottom: 10 },
  sourceTitle: { fontFamily: 'Inter_500Medium', fontSize: 13, lineHeight: 18 },
  sourceMeta: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },
  relatedSection: { marginBottom: 24 },
  stickyFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 88, borderTopWidth: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16, elevation: 8 },
  ctaButton: { width: '100%' },
});
