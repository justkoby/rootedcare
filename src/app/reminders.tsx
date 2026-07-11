import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  useColorScheme,
  ScrollView,
  Pressable,
  Switch,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Bell, CheckCircle, Circle, Plus, Clock } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { herbs } from '../data/herbs';
import { useReminderStore } from '../store/useReminderStore';
import { scheduleDailyReminder, cancelReminder, requestPermissions } from '../services/notificationService';

export default function RemindersScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  const reminders = useReminderStore((s) => s.reminders);
  const dailyEnabled = useReminderStore((s) => s.dailyEnabled);
  const setDailyEnabled = useReminderStore((s) => s.setDailyEnabled);
  const toggleReminder = useReminderStore((s) => s.toggleReminder);

  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    reminders.forEach((r) => {
      if (r.enabled && dailyEnabled) {
        const [h, m] = r.time.split(':').map(Number);
        if (!isNaN(h)) {
          scheduleDailyReminder(r.id, r.label, h, m || 0);
        }
      } else {
        cancelReminder(r.id);
      }
    });
  }, [reminders, dailyEnabled]);

  const getTimeDisplay = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    if (isNaN(h)) return time;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m?.toString().padStart(2, '0') || '00'} ${ampm}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={[styles.navBar, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.text }]}>Reminders</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={[styles.tagline, { color: colors.textMuted }]}>Never miss your herbs.</Text>
        </View>

        <View style={[styles.dailyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.dailyIconBg, { backgroundColor: colors.border }]}>
            <Bell size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.dailyTitle, { color: colors.text }]}>Daily Reminder</Text>
            <Text style={[styles.dailySubtitle, { color: colors.textMuted }]}>
              Get reminded about your herbs and care.
            </Text>
          </View>
          <Switch
            value={dailyEnabled}
            onValueChange={setDailyEnabled}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Reminders</Text>
            <Pressable
              style={[styles.addReminderBtn, { borderColor: colors.primary }]}
              onPress={() => router.push('/add-to-plan' as any)}
            >
              <Plus size={14} color={colors.primary} />
              <Text style={[styles.addReminderLabel, { color: colors.primary }]}>Add</Text>
            </Pressable>
          </View>

          {reminders.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Add herbs to your care plan to create reminders.
              </Text>
            </View>
          ) : (
            reminders.map(reminder => {
              const herb = herbs.find(h => h.id === reminder.herbId);
              return (
                <View
                  key={reminder.id}
                  style={[
                    styles.reminderCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      opacity: reminder.enabled && dailyEnabled ? 1 : 0.55,
                    }
                  ]}
                >
                  <View style={styles.reminderLeft}>
                    {herb && <Image source={herb.image} style={styles.reminderThumb} />}
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.reminderLabel, { color: colors.text }]}>{reminder.label}</Text>
                      <View style={styles.reminderMeta}>
                        <Clock size={13} color={colors.textMuted} />
                        <Text style={[styles.reminderTime, { color: colors.textMuted }]}>
                          {reminder.days?.join(', ') || 'Every day'} • {getTimeDisplay(reminder.time)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Pressable onPress={() => toggleReminder(reminder.id)}>
                    {reminder.enabled
                      ? <CheckCircle size={24} color={colors.accent} />
                      : <Circle size={24} color={colors.border} />
                    }
                  </Pressable>
                </View>
              );
            })
          )}
        </View>

        <View style={[styles.tipCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.tipText}>
            💡 Consistency is key. Taking your herbs at the same time each day improves effectiveness.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  navTitle: { flex: 1, textAlign: 'center', fontFamily: 'Poppins_600SemiBold', fontSize: 18 },
  scrollContent: { paddingBottom: 60, paddingTop: 8 },
  headerSection: { paddingHorizontal: 24, paddingVertical: 12 },
  tagline: { fontFamily: 'Inter_400Regular', fontSize: 16 },
  dailyCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 24, padding: 18,
    borderRadius: 20, borderWidth: 1, marginBottom: 28,
  },
  dailyIconBg: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  dailyTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 16 },
  dailySubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 2, lineHeight: 18 },
  section: { paddingHorizontal: 24, marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 20 },
  addReminderBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
  },
  addReminderLabel: { fontFamily: 'Poppins_500Medium', fontSize: 13 },
  emptyCard: { borderRadius: 16, borderWidth: 1, padding: 24, alignItems: 'center' },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  reminderCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 12,
  },
  reminderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 14 },
  reminderThumb: { width: 50, height: 50, borderRadius: 12 },
  reminderLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 15 },
  reminderMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  reminderTime: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  tipCard: {
    marginHorizontal: 24, borderRadius: 20, padding: 18, marginBottom: 16,
  },
  tipText: {
    fontFamily: 'Inter_400Regular', fontSize: 15,
    color: '#FFFFFF', lineHeight: 22,
  },
});
