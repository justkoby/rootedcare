import React, { useState } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, StatusBar,
  useColorScheme, ScrollView, Pressable, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, BookOpen, X } from 'lucide-react-native';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { useJournalStore, JournalEntry } from '../store/useJournalStore';
import { herbs } from '../data/herbs';
import { useMoodStore } from '../store/useMoodStore';

const SYMPTOMS = ['Headache', 'Bloating', 'Fatigue', 'Stress', 'Cough', 'Sore Throat', 'Nausea', 'Low Energy', 'Skin Rash', 'Fever'];

export default function JournalScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const entries = useJournalStore((s) => s.entries);
  const addEntry = useJournalStore((s) => s.addEntry);
  const todayMood = useMoodStore((s) => s.getMood());

  const [showForm, setShowForm] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedHerbs, setSelectedHerbs] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const today = new Date().toISOString().split('T')[0];
  const todayEntries = entries.filter((e) => e.date === today);
  const recentEntries = entries.slice(0, 10);

  const handleSave = () => {
    if (!notes.trim()) return;
    addEntry({
      date: today,
      mood: todayMood || '',
      notes: notes.trim(),
      herbsTaken: selectedHerbs,
      symptoms: selectedSymptoms,
    });
    setNotes('');
    setSelectedHerbs([]);
    setSelectedSymptoms([]);
    setShowForm(false);
  };

  const toggleHerb = (id: string) => {
    setSelectedHerbs((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Wellness Journal</Text>
        <Pressable onPress={() => setShowForm(!showForm)} style={styles.addBtn}>
          {showForm ? <X size={20} color={colors.text} /> : <Plus size={20} color={colors.primary} />}
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {showForm && (
          <Animated.View
            entering={FadeInUp.duration(300).springify()}
            style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.formTitle, { color: colors.text }]}>New Entry</Text>

            <Text style={[styles.label, { color: colors.textMuted }]}>Herbs Taken</Text>
            <View style={styles.chipRow}>
              {herbs.map((h) => (
                <Pressable
                  key={h.id}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selectedHerbs.includes(h.id) ? colors.primary : colors.background,
                      borderColor: selectedHerbs.includes(h.id) ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => toggleHerb(h.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: selectedHerbs.includes(h.id) ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {h.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.textMuted }]}>Symptoms</Text>
            <View style={styles.chipRow}>
              {SYMPTOMS.map((s) => (
                <Pressable
                  key={s}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selectedSymptoms.includes(s) ? colors.warning : colors.background,
                      borderColor: selectedSymptoms.includes(s) ? colors.warning : colors.border,
                    },
                  ]}
                  onPress={() => toggleSymptom(s)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: selectedSymptoms.includes(s) ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {s}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.textMuted }]}>Notes</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="How are you feeling today?"
              placeholderTextColor={colors.textMuted}
              multiline
              value={notes}
              onChangeText={setNotes}
            />

            <Pressable
              style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: notes.trim() ? 1 : 0.5 }]}
              onPress={handleSave}
              disabled={!notes.trim()}
            >
              <Text style={styles.saveBtnText}>Save Entry</Text>
            </Pressable>
          </Animated.View>
        )}

        {todayEntries.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Today</Text>
            {todayEntries.map((entry, i) => (
              <Animated.View
                key={entry.id}
                entering={FadeInUp.delay(i * 80).duration(300).springify()}
                style={[styles.entryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.entryHeader}>
                  <Text style={[styles.entryMood, { color: colors.primary }]}>
                    Mood: {entry.mood || 'Not logged'}
                  </Text>
                  <Text style={[styles.entryTime, { color: colors.textMuted }]}>
                    {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                {entry.herbsTaken.length > 0 && (
                  <Text style={[styles.entryMeta, { color: colors.textMuted }]}>
                    Herbs: {entry.herbsTaken.map((h) => herbs.find((x) => x.id === h)?.name || h).join(', ')}
                  </Text>
                )}
                {entry.symptoms.length > 0 && (
                  <Text style={[styles.entryMeta, { color: colors.textMuted }]}>
                    Symptoms: {entry.symptoms.join(', ')}
                  </Text>
                )}
                <Text style={[styles.entryNotes, { color: colors.text }]}>{entry.notes}</Text>
              </Animated.View>
            ))}
          </View>
        )}

        {recentEntries.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Entries</Text>
            {recentEntries.map((entry, i) => (
              <Animated.View
                key={entry.id}
                entering={FadeInUp.delay(i * 60).duration(300).springify()}
                style={[styles.entryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.entryHeader}>
                  <Text style={[styles.entryDate, { color: colors.primary }]}>{entry.date}</Text>
                  <Text style={[styles.entryTime, { color: colors.textMuted }]}>
                    Mood: {entry.mood || '—'}
                  </Text>
                </View>
                <Text style={[styles.entryNotes, { color: colors.text }]} numberOfLines={2}>
                  {entry.notes}
                </Text>
              </Animated.View>
            ))}
          </View>
        )}

        {entries.length === 0 && !showForm && (
          <View style={styles.empty}>
            <BookOpen size={48} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No journal entries yet</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
              Tap + to record your first wellness note.
            </Text>
          </View>
        )}
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
  addBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 40 },
  formCard: { margin: 16, padding: 20, borderRadius: 20, borderWidth: 1, gap: 16 },
  formTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 13, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontFamily: 'Poppins_500Medium', fontSize: 13 },
  textInput: { borderRadius: 14, borderWidth: 1, padding: 14, minHeight: 100, fontFamily: 'Inter_400Regular', fontSize: 15, textAlignVertical: 'top' },
  saveBtn: { borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  saveBtnText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FFFFFF' },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, marginBottom: 12 },
  entryCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 10, gap: 6 },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entryMood: { fontFamily: 'Poppins_500Medium', fontSize: 13 },
  entryDate: { fontFamily: 'Poppins_600SemiBold', fontSize: 14 },
  entryTime: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  entryMeta: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18 },
  entryNotes: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 22, marginTop: 4 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 100, gap: 12 },
  emptyTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 20 },
  emptySub: { fontFamily: 'Inter_400Regular', fontSize: 15, textAlign: 'center', lineHeight: 22, paddingHorizontal: 40 },
});
