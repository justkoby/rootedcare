import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  useColorScheme,
  ScrollView,
  Pressable,
  Image,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  ChevronDown,
  StickyNote,
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { herbs } from '../data/herbs';
import { Button } from '../components/Button';
import { useCarePlanStore } from '../store/useCarePlanStore';
import { useAuth } from '../context/AuthContext';

type TimeSlot = 'morning' | 'afternoon' | 'evening';

export default function AddToPlanScreen() {
  const router = useRouter();
  const { herbId: paramHerbId } = useLocalSearchParams<{ herbId?: string }>();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const addEntry = useCarePlanStore((s) => s.addEntry);
  const { user } = useAuth();

  const [selectedHerbId, setSelectedHerbId] = useState<string>(paramHerbId || 'ginger');
  const [selectedTime, setSelectedTime] = useState<TimeSlot>('morning');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [adding, setAdding] = useState(false);
  const [showHerbPicker, setShowHerbPicker] = useState(false);

  const selectedHerb = herbs.find(h => h.id === selectedHerbId);
  const timeSlots: TimeSlot[] = ['morning', 'afternoon', 'evening'];

  const handleAdd = async () => {
    if (!selectedHerb) return;

    try {
      setAdding(true);

      await addEntry({
        herbId: selectedHerbId,
        timeOfDay: selectedTime,
        label: selectedHerb.name,
        purpose: purpose.trim() || `Take ${selectedHerb.name}`,
        notes: notes.trim(),
      }, user?.id);

      Alert.alert(
        'Added to plan',
        `${selectedHerb.name} has been added to your care plan.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to add to plan.';

      Alert.alert('Something went wrong', message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Navigation bar */}
      <View style={[styles.navBar, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.text }]}>Add to My Care</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Selected herb preview */}
        {selectedHerb && (
          <View style={[styles.herbPreview, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Image source={selectedHerb.image} style={styles.herbPreviewImg} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.herbPreviewName, { color: colors.text }]}>{selectedHerb.name}</Text>
              <Text style={styles.herbPreviewSci}>{selectedHerb.scientificName}</Text>
            </View>
          </View>
        )}

        {/* Herb selector dropdown */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Select Herb</Text>
          <Pressable
            style={[styles.dropdownTrigger, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowHerbPicker(!showHerbPicker)}
          >
            <Text style={[styles.dropdownValue, { color: colors.text }]}>{selectedHerb?.name ?? 'Choose a herb'}</Text>
            <ChevronDown size={18} color={colors.textMuted} />
          </Pressable>

          {showHerbPicker && (
            <View style={[styles.picker, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {herbs.map(herb => (
                <Pressable
                  key={herb.id}
                  style={[
                    styles.pickerItem,
                    { borderBottomColor: colors.border },
                    selectedHerbId === herb.id && { backgroundColor: colors.border }
                  ]}
                  onPress={() => {
                    setSelectedHerbId(herb.id);
                    setShowHerbPicker(false);
                  }}
                >
                  <Image source={herb.image} style={styles.pickerThumb} />
                  <View>
                    <Text style={[styles.pickerName, { color: colors.text }]}>{herb.name}</Text>
                    <Text style={styles.pickerSci}>{herb.scientificName}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* When to take */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>When to take</Text>
          <View style={styles.timeSlots}>
            {timeSlots.map(t => (
              <Pressable
                key={t}
                style={[
                  styles.timeBtn,
                  {
                    backgroundColor: selectedTime === t ? colors.primary : colors.card,
                    borderColor: selectedTime === t ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => setSelectedTime(t)}
              >
                <Text style={[
                  styles.timeBtnLabel,
                  { color: selectedTime === t ? '#FFFFFF' : colors.textMuted }
                ]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Purpose input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Purpose</Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              placeholder="e.g. Improve digestion, boost immunity..."
              placeholderTextColor={colors.textMuted}
              value={purpose}
              onChangeText={setPurpose}
              style={[styles.textInput, { color: colors.text }]}
            />
          </View>
        </View>

        {/* Notes input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Notes (Optional)</Text>
          <View style={[styles.inputWrapper, styles.notesWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <StickyNote size={16} color={colors.textMuted} style={{ marginRight: 10, marginTop: 2 }} />
            <TextInput
              placeholder="Add a note..."
              placeholderTextColor={colors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={[styles.textInput, styles.notesInput, { color: colors.text }]}
            />
          </View>
        </View>

        {/* When to take guidance from data */}
        {selectedHerb && (
          <View style={[styles.guidanceCard, { backgroundColor: colors.border }]}>
            <Text style={[styles.guidanceTitle, { color: colors.text }]}>💡 Recommended</Text>
            <Text style={[styles.guidanceText, { color: colors.textMuted }]}>{selectedHerb.whenToTake}</Text>
          </View>
        )}

      </ScrollView>

      {/* Sticky bottom CTA */}
      <View style={[styles.stickyFooter, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Button
          title={adding ? 'Adding...' : 'Add to Plan'}
          variant="primary"
          onPress={handleAdd}
          disabled={adding}
          loading={adding}
          style={styles.ctaButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  navTitle: { flex: 1, textAlign: 'center', fontFamily: 'Poppins_600SemiBold', fontSize: 18 },

  scrollContent: { paddingBottom: 110, paddingTop: 20 },

  herbPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
    gap: 14,
  },
  herbPreviewImg: { width: 64, height: 64, borderRadius: 14 },
  herbPreviewName: { fontFamily: 'Poppins_600SemiBold', fontSize: 17 },
  herbPreviewSci: {
    fontFamily: 'Inter_400Regular', fontStyle: 'italic',
    fontSize: 13, color: '#9E9E9E', marginTop: 2,
  },

  section: { marginHorizontal: 24, marginBottom: 20 },
  label: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, marginBottom: 10 },

  dropdownTrigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
  },
  dropdownValue: { fontFamily: 'Inter_400Regular', fontSize: 15 },

  picker: {
    borderWidth: 1, borderRadius: 14, marginTop: 6, overflow: 'hidden',
  },
  pickerItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderBottomWidth: 1,
  },
  pickerThumb: { width: 40, height: 40, borderRadius: 10 },
  pickerName: { fontFamily: 'Poppins_500Medium', fontSize: 14 },
  pickerSci: { fontFamily: 'Inter_400Regular', fontStyle: 'italic', fontSize: 12, color: '#9E9E9E' },

  timeSlots: { flexDirection: 'row', gap: 10 },
  timeBtn: {
    flex: 1, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1.5,
    alignItems: 'center',
  },
  timeBtnLabel: { fontFamily: 'Poppins_500Medium', fontSize: 14 },

  inputWrapper: {
    borderWidth: 1, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'flex-start',
  },
  notesWrapper: { alignItems: 'flex-start' },
  textInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, padding: 0 },
  notesInput: { minHeight: 70, textAlignVertical: 'top' },

  guidanceCard: {
    marginHorizontal: 24, padding: 16,
    borderRadius: 16, marginBottom: 16, gap: 6,
  },
  guidanceTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 14 },
  guidanceText: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20 },

  stickyFooter: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopWidth: 1, paddingHorizontal: 24, paddingVertical: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.03, shadowRadius: 10, elevation: 8,
  },
  ctaButton: { width: '100%' },
});
