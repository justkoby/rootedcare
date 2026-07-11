import React, { useState, useMemo } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, StatusBar,
  useColorScheme, ScrollView, Pressable, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, AlertTriangle, ChevronRight } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { herbs } from '../data/herbs';

const SYMPTOMS = [
  { id: 'Headache',             emoji: '🤕', label: 'Headache'           },
  { id: 'Stomach Ache',         emoji: '🫀', label: 'Stomach Ache'       },
  { id: 'Bloating',             emoji: '😮‍💨', label: 'Bloating'            },
  { id: 'Stress',               emoji: '😟', label: 'Stress'             },
  { id: 'Difficulty Sleeping',  emoji: '💤', label: 'Difficulty Sleeping' },
  { id: 'Menstrual Cramps',     emoji: '🩸', label: 'Menstrual Cramps'   },
  { id: 'Cold',                 emoji: '🤧', label: 'Cold'               },
  { id: 'Sore Throat',          emoji: '🔴', label: 'Sore Throat'        },
  { id: 'Cough',                emoji: '😮', label: 'Cough'              },
  { id: 'Skin Rash',            emoji: '🌡️', label: 'Skin Rash'          },
  { id: 'Fever',                emoji: '🌡️', label: 'Fever'              },
  { id: 'Fatigue',              emoji: '😴', label: 'Fatigue'            },
  { id: 'Nausea',               emoji: '🤢', label: 'Nausea'             },
];

export default function SymptomCheckerScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  const [selected, setSelected] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const matchedHerbs = useMemo(() => {
    if (selected.length === 0) return [];
    return herbs.filter(herb =>
      herb.symptoms.some(s => selected.includes(s))
    ).sort((a, b) => {
      const aScore = a.symptoms.filter(s => selected.includes(s)).length;
      const bScore = b.symptoms.filter(s => selected.includes(s)).length;
      return bScore - aScore;
    });
  }, [selected]);

  const matchScore = (herb: typeof herbs[0]) =>
    herb.symptoms.filter(s => selected.includes(s)).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={[styles.navBar, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => showResults ? setShowResults(false) : router.back()}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.text }]}>
          {showResults ? 'Herb Suggestions' : 'Symptom Checker'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {!showResults ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          <Text style={[styles.pageTitle, { color: colors.text }]}>What are you experiencing today?</Text>
          <Text style={[styles.pageSub, { color: colors.textMuted }]}>Select all that apply</Text>

          {/* Symptom grid */}
          <View style={styles.grid}>
            {SYMPTOMS.map(sym => {
              const isSelected = selected.includes(sym.id);
              return (
                <Pressable
                  key={sym.id}
                  style={[
                    styles.symptomChip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                    }
                  ]}
                  onPress={() => toggle(sym.id)}
                >
                  <Text style={styles.chipEmoji}>{sym.emoji}</Text>
                  <Text style={[styles.chipLabel, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                    {sym.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* CTA */}
          <Pressable
            style={[
              styles.findBtn,
              { backgroundColor: selected.length > 0 ? colors.primary : colors.border }
            ]}
            onPress={() => selected.length > 0 && setShowResults(true)}
            disabled={selected.length === 0}
          >
            <Text style={[styles.findBtnText, { opacity: selected.length > 0 ? 1 : 0.5 }]}>
              Find Herbal Suggestions →
            </Text>
          </Pressable>

          {selected.length > 0 && (
            <Text style={[styles.countNote, { color: colors.textMuted }]}>
              {selected.length} symptom{selected.length > 1 ? 's' : ''} selected · {matchedHerbs.length} herb{matchedHerbs.length !== 1 ? 's' : ''} found
            </Text>
          )}

        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Educational disclaimer */}
          <View style={[styles.disclaimer, { backgroundColor: colors.warning + '18', borderColor: colors.warning + '44' }]}>
            <AlertTriangle size={18} color={colors.warning} />
            <Text style={[styles.disclaimerText, { color: colors.text }]}>
              This is educational information only and is not a medical diagnosis. If your symptoms are severe or persistent, please seek advice from a qualified healthcare professional.
            </Text>
          </View>

          {/* Selected symptoms */}
          <View style={styles.selectedSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Symptoms</Text>
            <View style={styles.selectedChips}>
              {selected.map(s => (
                <View key={s} style={[styles.selectedChip, { backgroundColor: colors.border }]}>
                  <Text style={[styles.selectedChipText, { color: colors.text }]}>{s}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Results */}
          <Text style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: 24, marginBottom: 14 }]}>
            Traditionally Used Herbs
          </Text>

          {matchedHerbs.length === 0 ? (
            <View style={styles.noResults}>
              <Text style={[styles.noResultsText, { color: colors.textMuted }]}>
                No specific herbs found for your selection. Try the Explore screen to browse all herbs.
              </Text>
            </View>
          ) : (
            matchedHerbs.map(herb => {
              const score = matchScore(herb);
              return (
                <Pressable
                  key={herb.id}
                  style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push(`/herb/${herb.id}` as any)}
                >
                  <Image source={herb.image} style={styles.resultThumb} />
                  <View style={styles.resultContent}>
                    <View style={styles.resultTop}>
                      <Text style={[styles.resultName, { color: colors.text }]}>{herb.name}</Text>
                      <View style={[styles.scoreBadge, { backgroundColor: colors.accent + '22' }]}>
                        <Text style={[styles.scoreText, { color: colors.accent }]}>
                          {score} match{score > 1 ? 'es' : ''}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.resultSci, { color: colors.textMuted }]}>{herb.scientificName}</Text>
                    <Text style={[styles.resultDesc, { color: colors.textMuted }]} numberOfLines={2}>
                      {herb.description}
                    </Text>
                    {/* Matching symptoms */}
                    <View style={styles.matchTags}>
                      {herb.symptoms.filter(s => selected.includes(s)).map(s => (
                        <View key={s} style={[styles.matchTag, { backgroundColor: colors.primary + '18' }]}>
                          <Text style={[styles.matchTagText, { color: colors.primary }]}>{s}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <ChevronRight size={16} color={colors.textMuted} />
                </Pressable>
              );
            })
          )}

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  navTitle: { flex: 1, textAlign: 'center', fontFamily: 'Poppins_600SemiBold', fontSize: 18 },
  scrollContent: { paddingBottom: 48, paddingTop: 24 },
  pageTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 22, paddingHorizontal: 24, marginBottom: 6 },
  pageSub: { fontFamily: 'Inter_400Regular', fontSize: 15, paddingHorizontal: 24, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 32 },
  symptomChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1.5, minWidth: '44%', flexGrow: 1 },
  chipEmoji: { fontSize: 18 },
  chipLabel: { fontFamily: 'Poppins_500Medium', fontSize: 14 },
  findBtn: { marginHorizontal: 24, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  findBtnText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FFFFFF' },
  countNote: { fontFamily: 'Inter_400Regular', fontSize: 13, textAlign: 'center' },
  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginHorizontal: 24, padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  disclaimerText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20 },
  selectedSection: { paddingHorizontal: 24, marginBottom: 24 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, marginBottom: 10 },
  selectedChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectedChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  selectedChipText: { fontFamily: 'Inter_500Medium', fontSize: 13 },
  resultCard: { flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: 24, padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 12 },
  resultThumb: { width: 72, height: 72, borderRadius: 14, marginRight: 14, flexShrink: 0 },
  resultContent: { flex: 1 },
  resultTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  resultName: { fontFamily: 'Poppins_600SemiBold', fontSize: 16 },
  scoreBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  scoreText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  resultSci: { fontFamily: 'Inter_400Regular', fontStyle: 'italic', fontSize: 12, marginBottom: 4 },
  resultDesc: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18, marginBottom: 8 },
  matchTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  matchTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  matchTagText: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  noResults: { paddingHorizontal: 24, alignItems: 'center', paddingTop: 20 },
  noResultsText: { fontFamily: 'Inter_400Regular', fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
