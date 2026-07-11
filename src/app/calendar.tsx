import React, { useState, useMemo } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, StatusBar,
  useColorScheme, ScrollView, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ChevronLeft, ChevronRight, CheckSquare, Square } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useCarePlanStore } from '../store/useCarePlanStore';
import { herbs } from '../data/herbs';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMonthDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

export default function CalendarScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const entries = useCarePlanStore((s) => s.entries);
  const toggleDone = useCarePlanStore((s) => s.toggleDone);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const days = useMemo(() => getMonthDays(year, month), [year, month]);
  const monthName = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const dayEntries = entries.filter((e) => {
    const d = new Date(e.createdAt);
    return d.getDate() === selectedDay && d.getMonth() === month && d.getFullYear() === year;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Calendar</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.monthNav}>
          <Pressable onPress={prevMonth} style={styles.navBtn}>
            <ChevronLeft size={20} color={colors.primary} />
          </Pressable>
          <Text style={[styles.monthTitle, { color: colors.text }]}>{monthName}</Text>
          <Pressable onPress={nextMonth} style={styles.navBtn}>
            <ChevronRight size={20} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.weekRow}>
          {DAYS.map(d => (
            <Text key={d} style={[styles.weekDay, { color: colors.textMuted }]}>{d}</Text>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {days.map((d, i) => (
            <Pressable
              key={i}
              style={[
                styles.dayCell,
                d === selectedDay && { backgroundColor: colors.primary },
                d === today.getDate() && month === today.getMonth() && year === today.getFullYear() && d !== selectedDay
                  ? { borderColor: colors.primary, borderWidth: 1.5 }
                  : {},
              ]}
              onPress={() => d && setSelectedDay(d)}
            >
              <Text style={[
                styles.dayText,
                { color: d ? colors.text : 'transparent' },
                d === selectedDay && { color: '#FFFFFF' },
              ]}>
                {d || ''}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.planSection}>
          <Text style={[styles.planTitle, { color: colors.text }]}>
            {monthName} — Day {selectedDay}
          </Text>
          {dayEntries.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No entries for this day.
              </Text>
            </View>
          ) : (
            dayEntries.map((entry, i) => {
              const herb = herbs.find(h => h.id === entry.herbId);
              return (
                <Animated.View
                  key={entry.id}
                  entering={FadeInUp.delay(i * 60).duration(300).springify()}
                  style={[styles.planCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <Pressable onPress={() => toggleDone(entry.id)}>
                    {entry.done
                      ? <CheckSquare size={22} color={colors.accent} />
                      : <Square size={22} color={colors.border} />
                    }
                  </Pressable>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.planLabel, { color: colors.text }]}>
                      {herb?.name || entry.label}
                    </Text>
                    <Text style={[styles.planTime, { color: colors.textMuted }]}>
                      {entry.timeOfDay.charAt(0).toUpperCase() + entry.timeOfDay.slice(1)}
                    </Text>
                  </View>
                </Animated.View>
              );
            })
          )}
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
  scrollContent: { paddingBottom: 40 },
  monthNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16,
  },
  navBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  monthTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18 },
  weekRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 8 },
  weekDay: { flex: 1, textAlign: 'center', fontFamily: 'Inter_500Medium', fontSize: 12 },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16 },
  dayCell: {
    width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center',
    borderRadius: 20,
  },
  dayText: { fontFamily: 'Poppins_500Medium', fontSize: 14 },
  planSection: { paddingHorizontal: 24, marginTop: 24 },
  planTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, marginBottom: 12 },
  emptyCard: { borderRadius: 16, borderWidth: 1, padding: 24, alignItems: 'center' },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 15, textAlign: 'center' },
  planCard: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderRadius: 16, borderWidth: 1, marginBottom: 10,
  },
  planLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 15 },
  planTime: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 2 },
});
