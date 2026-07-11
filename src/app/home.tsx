import React, { useMemo } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, StatusBar,
  useColorScheme, Image, ScrollView, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInUp,
} from 'react-native-reanimated';
import {
  Bell, Search, ChevronRight, MessageCircle,
  Home as HomeIcon, BookOpen, User, Calendar,
  Droplets, Moon, Heart, Activity, CheckCircle,
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { herbs } from '../data/herbs';
import { HerbCard } from '../components/HerbCard';
import { AnimatedPressable, AnimatedTabBar } from '../components/animations';
import { useAuthStore } from '../store/useAuthStore';
import { useMoodStore } from '../store/useMoodStore';
import { useTrackerStore } from '../store/useTrackerStore';
import { useCarePlanStore } from '../store/useCarePlanStore';

type MoodId = 'great' | 'calm' | 'tired' | 'pain' | 'stressed';
interface Mood { id: MoodId; emoji: string; label: string }
const MOODS: Mood[] = [
  { id: 'great',   emoji: '😊', label: 'Great'   },
  { id: 'calm',    emoji: '😌', label: 'Calm'    },
  { id: 'tired',   emoji: '😴', label: 'Tired'   },
  { id: 'pain',    emoji: '🤕', label: 'In Pain' },
  { id: 'stressed',emoji: '😟', label: 'Stressed'},
];

const MOOD_FEEDBACK: Record<MoodId, { feedback: string; steps: string[]; recommendations?: { name: string; id: string }[] }> = {
  great: {
    feedback: "We’re so happy to hear that! Let’s keep doing what we’re doing to maintain this wonderful wellness. 🌿",
    steps: [
      "Keep following your current herbal care plan.",
      "Stay hydrated and maintain your active daily routine.",
      "Take a moment to write down what you are grateful for today."
    ]
  },
  calm: {
    feedback: "A calm mind is a powerful foundation for wellness. Let’s nurture this peaceful energy. 😌",
    steps: [
      "Sip a quiet cup of Hibiscus or Lemongrass tea.",
      "Take 5 minutes for deep breathing or a short walk.",
      "Journal about your peaceful moments today."
    ],
    recommendations: [
      { name: "Hibiscus", id: "hibiscus" },
      { name: "Moringa", id: "moringa" }
    ]
  },
  tired: {
    feedback: "Feeling tired is your body’s way of asking for rest. Listen to your body and honor its needs today. 😴",
    steps: [
      "Take short, regular rest breaks throughout the day.",
      "Try some Moringa in the morning or warm Ginger tea for a natural boost.",
      "Aim for an early and relaxing bedtime tonight."
    ],
    recommendations: [
      { name: "Moringa", id: "moringa" },
      { name: "Ginger", id: "ginger" }
    ]
  },
  pain: {
    feedback: "We’re sorry you are experiencing pain. Focus on comforting and gentle healing remedies. 🤕",
    steps: [
      "Sip warm, anti-inflammatory Ginger tea.",
      "Apply warmth or rest to the area of discomfort.",
      "Check your symptoms to find other natural recommendations."
    ],
    recommendations: [
      { name: "Ginger", id: "ginger" },
      { name: "Prekese", id: "prekese" }
    ]
  },
  stressed: {
    feedback: "Take a deep breath. You are doing great, and it is okay to take a moment just for yourself. 😟",
    steps: [
      "Drink a warm, soothing cup of Hibiscus tea.",
      "Do a gentle stretch or a 10-minute screen-free pause.",
      "Try to spend a few minutes outside in natural light."
    ],
    recommendations: [
      { name: "Hibiscus", id: "hibiscus" },
      { name: "Moringa", id: "moringa" }
    ]
  }
};

const WELLNESS_TIPS = [
  { emoji: '💧', text: 'Drink 2 litres of water today' },
  { emoji: '🍋', text: 'Add lemon to warm water in the morning' },
  { emoji: '🌱', text: 'Plant of the day: Moringa — nature\'s superfood' },
  { emoji: '✨', text: '"Your body heals when you give it what it needs."' },
];

const ARTICLE_LINKS = [
  { id: 'ginger-power', tag: 'Herbs',   title: 'The Power of Ginger: More Than a Spice', herbId: 'ginger'   },
  { id: 'moringa-superfood', tag: 'Wellness', title: 'Boost Immunity Naturally with Moringa',   herbId: 'moringa'  },
  { id: 'cycle-wellness', tag: 'Cycle',   title: 'Natural Support for Every Phase',          herbId: 'hibiscus' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

const TAB_CONFIG = [
  { key: 'home',     icon: <HomeIcon />,   label: 'Home'    },
  { key: 'explore',  icon: <Search />,     label: 'Explore' },
  { key: 'my-care',  icon: <Calendar />,   label: 'My Care' },
  { key: 'learn',    icon: <BookOpen />,    label: 'Library' },
  { key: 'profile',  icon: <User />,       label: 'Profile' },
];

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  const userName = useAuthStore((s) => s.name);
  const todayMood = useMoodStore((s) => s.todayMood);
  const setMood = useMoodStore((s) => s.setMood);
  const water = useTrackerStore((s) => s.water);
  const setWater = useTrackerStore((s) => s.setWater);
  const sleep = useTrackerStore((s) => s.sleep);
  const setSleep = useTrackerStore((s) => s.setSleep);
  const energy = useTrackerStore((s) => s.energy);
  const setEnergy = useTrackerStore((s) => s.setEnergy);
  const entries = useCarePlanStore((s) => s.entries);
  const { done, total } = useMemo(() => {
    const done = entries.filter(e => e.done).length;
    return { done, total: entries.length };
  }, [entries]);

  const [tipIndex, setTipIndex] = React.useState(0);

  const recentlyViewed = herbs.slice(0, 3);
  const featured = herbs.slice(0, 4);

  const handleTabPress = (key: string) => {
    const routes: Record<string, string> = {
      home: '/home',
      explore: '/explore',
      'my-care': '/my-care',
      learn: '/learn',
      profile: '/profile',
    };
    if (routes[key] && key !== 'home') {
      router.push(routes[key] as any);
    }
  };

  const sectionDelay = (i: number) => i * 80;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── TOP BAR ── */}
        <Animated.View
          entering={FadeInUp.duration(500).springify()}
          style={styles.topBar}
        >
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>
              {getGreeting()}, {userName} 🌿
            </Text>
            <Text style={[styles.greetingSub, { color: colors.textMuted }]}>
              Your wellness companion
            </Text>
          </View>
          <Pressable style={[styles.bellBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/reminders' as any)}>
            <Bell size={20} color={colors.primary} />
          </Pressable>
        </Animated.View>

        {/* ── MOOD CHECK-IN ── */}
        <Animated.View
          entering={FadeInUp.delay(sectionDelay(1)).duration(400).springify()}
          style={[styles.moodCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text style={[styles.moodTitle, { color: colors.text }]}>How are you feeling today?</Text>
          <View style={styles.moodRow}>
            {MOODS.map(m => (
              <Pressable
                key={m.id}
                style={[
                  styles.moodChip,
                  {
                    backgroundColor: todayMood === m.id ? colors.primary : colors.background,
                    borderColor: todayMood === m.id ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => setMood(m.id)}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[styles.moodLabel, { color: todayMood === m.id ? '#FFFFFF' : colors.textMuted }]}>
                  {m.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {todayMood && (
            <Animated.View
              entering={FadeInUp.duration(300)}
              style={styles.feedbackContainer}
            >
              <View style={[styles.feedbackSeparator, { backgroundColor: colors.border }]} />
              
              <Text style={[styles.feedbackText, { color: colors.text }]}>
                {MOOD_FEEDBACK[todayMood as MoodId].feedback}
              </Text>

              <Text style={[styles.stepsTitle, { color: colors.textMuted }]}>
                Recommended Steps:
              </Text>
              
              {MOOD_FEEDBACK[todayMood as MoodId].steps.map((step, idx) => (
                <View key={idx} style={styles.stepRow}>
                  <CheckCircle size={16} color={colors.accent} style={{ marginTop: 2 }} />
                  <Text style={[styles.stepText, { color: colors.text }]}>{step}</Text>
                </View>
              ))}

              {/* Recommendations and actions if not happy (i.e. not "great") */}
              {todayMood !== 'great' && (
                <View style={styles.notHappyContainer}>
                  <View style={[styles.feedbackSeparator, { backgroundColor: colors.border }]} />
                  <Text style={[styles.recTitle, { color: colors.text }]}>
                    Try other herbs & recommendations:
                  </Text>
                  
                  {MOOD_FEEDBACK[todayMood as MoodId].recommendations && (
                    <View style={styles.recRow}>
                      {MOOD_FEEDBACK[todayMood as MoodId].recommendations?.map(herbRec => (
                        <Pressable
                          key={herbRec.id}
                          style={[styles.recChip, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '44' }]}
                          onPress={() => router.push(`/herb/${herbRec.id}` as any)}
                        >
                          <Text style={[styles.recChipText, { color: colors.primary }]}>🌿 {herbRec.name}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}

                  <View style={styles.actionRow}>
                    <Pressable
                      style={[styles.actionBtn, { borderColor: colors.border }]}
                      onPress={() => router.push('/explore' as any)}
                    >
                      <Text style={[styles.actionBtnText, { color: colors.primary }]}>Explore All Herbs →</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.actionBtn, { borderColor: colors.border }]}
                      onPress={() => router.push('/symptom-checker' as any)}
                    >
                      <Text style={[styles.actionBtnText, { color: colors.primary }]}>Symptom Checker →</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </Animated.View>
          )}
        </Animated.View>

        {/* ── SEARCH BAR ── */}
        <Animated.View
          entering={FadeInUp.delay(sectionDelay(2)).duration(400).springify()}
        >
          <AnimatedPressable
            style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/search' as any)}
          >
            <Search size={18} color={colors.textMuted} />
            <Text style={[styles.searchPlaceholder, { color: colors.textMuted }]}>
              Search herbs, wellness and articles
            </Text>
          </AnimatedPressable>
        </Animated.View>

        {/* ── QUICK CATEGORIES ── */}
        <Animated.View
          entering={FadeInUp.delay(sectionDelay(3)).duration(400).springify()}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Categories</Text>
            <Pressable onPress={() => router.push('/explore' as any)}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            {[
              { emoji: '🌸', label: "Women's Health", color: '#FCE4EC' },
              { emoji: '🫀', label: 'Digestion',      color: '#E8F5E9' },
              { emoji: '🛡️', label: 'Immunity',        color: '#E8F0FE' },
              { emoji: '✨', label: 'Skin Care',       color: '#FFF8E1' },
              { emoji: '💤', label: 'Sleep',           color: '#EDE7F6' },
              { emoji: '🧘', label: 'Stress',          color: '#F3E5F5' },
            ].map((cat, i) => (
              <AnimatedPressable
                key={cat.label}
                style={[styles.catChip, { backgroundColor: cat.color }]}
                onPress={() => router.push('/explore' as any)}
              >
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                <Text style={[styles.catLabel, { color: '#2E2E2E' }]}>{cat.label}</Text>
              </AnimatedPressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* ── TODAY'S WELLNESS ── */}
        <Animated.View
          entering={FadeInUp.delay(sectionDelay(4)).duration(400).springify()}
        >
          <View style={[styles.wellnessCard, { backgroundColor: colors.primary }]}>
            <View style={styles.wellnessTop}>
              <Text style={styles.wellnessHeadline}>🌿 Today’s Wellness</Text>
              <Pressable
                onPress={() => setTipIndex(i => (i + 1) % WELLNESS_TIPS.length)}
                style={[styles.nextTipBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
              >
                <ChevronRight size={16} color="#FFFFFF" />
              </Pressable>
            </View>
            <Text style={styles.wellnessTip}>
              {WELLNESS_TIPS[tipIndex].emoji} {WELLNESS_TIPS[tipIndex].text}
            </Text>
            <View style={styles.miniTrackers}>
              {[
                { Icon: Droplets, label: 'Water',   value: `${water}/8`, target: 8, setter: setWater, current: water },
                { Icon: Moon,     label: 'Sleep',   value: `${sleep}h`, target: 8, setter: setSleep, current: sleep },
                { Icon: Activity, label: 'Energy',  value: `${'⚡'.repeat(energy || 1)}`, target: 5, setter: setEnergy, current: energy || 1 },
              ].map(t => (
                <Pressable
                  key={t.label}
                  style={[styles.miniTracker, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                  onPress={() => t.setter(t.current >= t.target ? 0 : t.current + 1)}
                >
                  <t.Icon size={14} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.miniTrackerValue}>{t.value}</Text>
                  <Text style={styles.miniTrackerLabel}>{t.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* ── RECENTLY VIEWED ── */}
        <Animated.View
          entering={FadeInUp.delay(sectionDelay(5)).duration(400).springify()}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Continue Reading</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentScroll}>
            {recentlyViewed.map(herb => (
              <Pressable
                key={herb.id}
                style={styles.recentCard}
                onPress={() => router.push(`/herb/${herb.id}` as any)}
              >
                <Image source={herb.image} style={styles.recentThumb} />
                <View style={[styles.recentInfo, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.recentName, { color: colors.text }]}>{herb.name}</Text>
                  <Text style={[styles.recentSci, { color: colors.textMuted }]} numberOfLines={1}>
                    {herb.scientificName}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* ── RECOMMENDED HERBS ── */}
        <Animated.View
          entering={FadeInUp.delay(sectionDelay(6)).duration(400).springify()}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended Herbs</Text>
            <Pressable onPress={() => router.push('/explore' as any)}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
            </Pressable>
          </View>
          <View style={styles.herbsGrid}>
            {featured.map(herb => (
              <View key={herb.id} style={styles.herbGridItem}>
                <HerbCard
                  herb={herb}
                  onPress={() => router.push(`/herb/${herb.id}` as any)}
                />
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── CARE PLAN SUMMARY ── */}
        <Animated.View
          entering={FadeInUp.delay(sectionDelay(7)).duration(400).springify()}
        >
          <AnimatedPressable
            style={[styles.carePlanCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/my-care-plan' as any)}
          >
            <View style={[styles.carePlanIcon, { backgroundColor: colors.primary + '20' }]}>
              <Heart size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.carePlanTitle, { color: colors.text }]}>My Care Plan</Text>
              <Text style={[styles.carePlanSub, { color: colors.textMuted }]}>{done} of {total} herbs taken today</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </AnimatedPressable>
        </Animated.View>

        {/* ── WELLNESS LIBRARY ── */}
        <Animated.View
          entering={FadeInUp.delay(sectionDelay(8)).duration(400).springify()}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Wellness Library</Text>
            <Pressable onPress={() => router.push('/learn' as any)}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
            </Pressable>
          </View>
          {ARTICLE_LINKS.map(article => {
            const herb = herbs.find(h => h.id === article.herbId);
            return (
              <AnimatedPressable
                key={article.id}
                style={[styles.articleCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/article/${article.id}` as any)}
              >
                {herb && <Image source={herb.image} style={styles.articleThumb} />}
                <View style={styles.articleContent}>
                  <View style={[styles.articleTag, { backgroundColor: colors.border }]}>
                    <Text style={[styles.articleTagText, { color: colors.primary }]}>{article.tag}</Text>
                  </View>
                  <Text style={[styles.articleTitle, { color: colors.text }]}>{article.title}</Text>
                </View>
                <ChevronRight size={16} color={colors.textMuted} />
              </AnimatedPressable>
            );
          })}
        </Animated.View>

        {/* ── SYMPTOM CHECKER CTA ── */}
        <Animated.View
          entering={FadeInUp.delay(sectionDelay(9)).duration(400).springify()}
        >
          <AnimatedPressable
            style={[styles.symptomCTA, { backgroundColor: colors.accent + '18', borderColor: colors.accent + '44' }]}
            onPress={() => router.push('/symptom-checker' as any)}
          >
            <Text style={{ fontSize: 28 }}>🩺</Text>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={[styles.symptomCTATitle, { color: colors.text }]}>Symptom Checker</Text>
              <Text style={[styles.symptomCTASub, { color: colors.textMuted }]}>
                Not sure which herb? Start with your symptoms.
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </AnimatedPressable>
        </Animated.View>

      </ScrollView>

      {/* ── FLOATING AI ASSISTANT BUTTON ── */}
      <Pressable
        onPress={() => router.push('/assistant' as any)}
        style={[
          styles.fab,
          { backgroundColor: colors.primary },
        ]}
      >
        <MessageCircle size={24} color="#ffffff" />
      </Pressable>

      {/* ── ANIMATED BOTTOM TAB BAR ── */}
      <AnimatedTabBar
        tabs={TAB_CONFIG}
        activeTab="home"
        onTabPress={handleTabPress}
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

  // Top bar
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 12 },
  greeting: { fontFamily: 'Poppins_600SemiBold', fontSize: 22, letterSpacing: -0.3 },
  greetingSub: { fontFamily: 'Inter_400Regular', fontSize: 14, marginTop: 2 },
  bellBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },

  // Mood
  moodCard: { marginHorizontal: 24, borderRadius: 20, padding: 18, borderWidth: 1, marginBottom: 16 },
  moodTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, marginBottom: 12 },
  moodRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  moodChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  moodEmoji: { fontSize: 16 },
  moodLabel: { fontFamily: 'Poppins_500Medium', fontSize: 12 },

  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 13, gap: 10, marginBottom: 20 },
  searchPlaceholder: { fontFamily: 'Inter_400Regular', fontSize: 15 },

  // Sections
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 12 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 20 },
  seeAll: { fontFamily: 'Inter_500Medium', fontSize: 14 },

  // Categories
  catScroll: { paddingHorizontal: 24, paddingBottom: 20, gap: 10 },
  catChip: { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, minWidth: 90 },
  catEmoji: { fontSize: 20, marginBottom: 4 },
  catLabel: { fontFamily: 'Poppins_500Medium', fontSize: 12 },

  // Wellness card
  wellnessCard: { marginHorizontal: 24, borderRadius: 24, padding: 20, marginBottom: 24 },
  wellnessTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  wellnessHeadline: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FFFFFF' },
  nextTipBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  wellnessTip: { fontFamily: 'Inter_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.9)', lineHeight: 22, marginBottom: 16 },
  miniTrackers: { flexDirection: 'row', gap: 8 },
  miniTracker: { flex: 1, borderRadius: 12, padding: 10, alignItems: 'center', gap: 4 },
  miniTrackerValue: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#FFFFFF' },
  miniTrackerLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.7)' },

  // Recently viewed
  recentScroll: { paddingHorizontal: 24, paddingBottom: 20, gap: 12 },
  recentCard: { width: 130 },
  recentThumb: { width: 130, height: 100, borderRadius: 16, marginBottom: -1 },
  recentInfo: { padding: 10, borderRadius: 16, borderWidth: 1, borderTopLeftRadius: 0, borderTopRightRadius: 0 },
  recentName: { fontFamily: 'Poppins_600SemiBold', fontSize: 13 },
  recentSci: { fontFamily: 'Inter_400Regular', fontStyle: 'italic', fontSize: 11, color: '#9E9E9E', marginTop: 2 },

  // Herb grid
  herbsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12, marginBottom: 20 },
  herbGridItem: { width: '46%', flexGrow: 1 },

  // Care plan card
  carePlanCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 24 },
  carePlanIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  carePlanTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 15 },
  carePlanSub: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 2 },

  // Articles
  articleCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, padding: 14, borderRadius: 20, borderWidth: 1, marginBottom: 10 },
  articleThumb: { width: 60, height: 60, borderRadius: 14, marginRight: 14 },
  articleContent: { flex: 1 },
  articleTag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 6 },
  articleTagText: { fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
  articleTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, lineHeight: 20 },

  // Symptom checker CTA
  symptomCTA: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, marginTop: 12, marginBottom: 8, padding: 18, borderRadius: 20, borderWidth: 1 },
  symptomCTATitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 16 },
  symptomCTASub: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 4, lineHeight: 18 },

  // Feedback Panel
  feedbackContainer: { marginTop: 16, width: '100%', gap: 10 },
  feedbackSeparator: { height: 1, marginVertical: 8, width: '100%' },
  feedbackText: { fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 20 },
  stepsTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
  stepRow: { flexDirection: 'row', gap: 10, paddingLeft: 4, alignItems: 'flex-start' },
  stepText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 18 },
  notHappyContainer: { gap: 10, width: '100%' },
  recTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, marginTop: 4 },
  recRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 4 },
  recChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  recChipText: { fontFamily: 'Poppins_500Medium', fontSize: 12 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  actionBtnText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12 },

  // Floating AI assistant button
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 50,
  },
});
