import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  useColorScheme,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Home as HomeIcon,
  Search,
  Calendar,
  BookOpen,
  User,
  Plus,
  Bell,
  CheckSquare,
  Square,
  ChevronRight,
  Leaf,
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { herbs } from '../data/herbs';
import { AnimatedTabBar } from '../components/animations';
import { useCarePlanStore } from '../store/useCarePlanStore';
import { useAuth } from '../context/AuthContext';

const TAB_CONFIG = [
  { key: 'home',     icon: <HomeIcon />,   label: 'Home'    },
  { key: 'explore',  icon: <Search />,     label: 'Explore' },
  { key: 'my-care',  icon: <Calendar />,   label: 'My Care' },
  { key: 'learn',    icon: <BookOpen />,    label: 'Library' },
  { key: 'profile',  icon: <User />,       label: 'Profile' },
];

export default function MyCarePlanScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const { user } = useAuth();

  const entries = useCarePlanStore((s) => s.entries);
  const toggleDone = useCarePlanStore((s) => s.toggleDone);
  const removeEntry = useCarePlanStore((s) => s.removeEntry);

  const doneCount = entries.filter(e => e.done).length;
  const progress = entries.length > 0 ? doneCount / entries.length : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>My Care Plan</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>Your personal herbal plan.</Text>
          </View>
          <Pressable
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/add-to-plan' as any)}
          >
            <Plus size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Progress bar */}
        <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.progressTop}>
            <Text style={[styles.progressTitle, { color: colors.text }]}>Today’s Progress</Text>
            <Text style={[styles.progressCount, { color: colors.primary }]}>{doneCount}/{entries.length} done</Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: colors.accent }]} />
          </View>
        </View>

        {/* Today's Plan */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Today’s Plan</Text>
            <Pressable
              onPress={() => router.push('/add-to-plan' as any)}
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
            >
              <Plus size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          {entries.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No herbs in your plan yet. Tap + to add one.
              </Text>
            </View>
          ) : (
            entries.map(entry => {
              const herb = herbs.find(h => h.id === entry.herbId);
              return (
                <Pressable
                  key={entry.id}
                  style={[styles.planCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => toggleDone(entry.id, user?.id)}
                  onLongPress={() => removeEntry(entry.id, user?.id)}
                >
                  {herb && (
                    <Image source={herb.image} style={styles.planThumb} />
                  )}
                  <View style={styles.planContent}>
                    <Text style={[styles.planLabel, { color: colors.text }]}>{entry.label}</Text>
                    <Text style={[styles.planTime, { color: colors.textMuted }]}>
                      {entry.timeOfDay.charAt(0).toUpperCase() + entry.timeOfDay.slice(1)}
                    </Text>
                  </View>
                  {entry.done
                    ? <CheckSquare size={22} color={colors.accent} />
                    : <Square size={22} color={colors.border} />
                  }
                </Pressable>
              );
            })
          )}
        </View>

        {/* Cycle Phase info */}
        <View style={[styles.cycleCard, { backgroundColor: colors.primary }]}>
          <Leaf size={18} color="rgba(255,255,255,0.7)" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.cycleTitle}>Cycle Phase</Text>
            <Text style={styles.cyclePhase}>Follicular Phase</Text>
            <Text style={styles.cycleDay}>Day 5 of 28</Text>
          </View>
          <View style={[styles.cycleMiniBar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <View style={[styles.cycleMiniProgress, { width: `${(5 / 28) * 100}%` }]} />
          </View>
        </View>

        {/* Reminders shortcut */}
        <Pressable
          style={[styles.remindersCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/reminders' as any)}
        >
          <View style={[styles.remindersIcon, { backgroundColor: colors.border }]}>
            <Bell size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.remindersTitle, { color: colors.text }]}>Reminders</Text>
            <Text style={[styles.remindersSubtitle, { color: colors.textMuted }]}>Never miss your herbs.</Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </Pressable>

      </ScrollView>

      {/* Bottom Tab Bar */}
      <AnimatedTabBar
        tabs={TAB_CONFIG}
        activeTab="my-care"
        onTabPress={(key) => {
          const routes: Record<string, string> = {
            home: '/home',
            explore: '/explore',
            'my-care': '/my-care-plan',
            learn: '/learn',
            profile: '/profile',
          };
          if (routes[key] && key !== 'my-care') {
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

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: { fontFamily: 'Poppins_600SemiBold', fontSize: 28, letterSpacing: -0.5 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 15, marginTop: 2 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  emptyCard: {
    borderRadius: 16, borderWidth: 1, padding: 24, alignItems: 'center',
  },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  addBtn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },

  progressCard: {
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 16 },
  progressCount: { fontFamily: 'Inter_500Medium', fontSize: 14 },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },

  section: { paddingHorizontal: 24, marginBottom: 20 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, marginBottom: 14 },

  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  planThumb: { width: 52, height: 52, borderRadius: 12, marginRight: 14 },
  planContent: { flex: 1 },
  planLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 16 },
  planTime: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 2 },

  cycleCard: {
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cycleTitle: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  cyclePhase: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FFFFFF' },
  cycleDay: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  cycleMiniBar: {
    position: 'absolute', bottom: 12, left: 20, right: 20,
    height: 4, borderRadius: 2, overflow: 'hidden',
  },
  cycleMiniProgress: { height: '100%', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 2 },

  remindersCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  remindersIcon: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  remindersTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 16 },
  remindersSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 2 },

});
