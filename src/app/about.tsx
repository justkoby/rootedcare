import React from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, StatusBar,
  useColorScheme, Pressable, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Leaf, Heart } from 'lucide-react-native';
import { Colors } from '../constants/Colors';

export default function AboutScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>About RootedCare</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoRow}>
          <Leaf size={40} color={colors.primary} />
          <Text style={[styles.appName, { color: colors.primary }]}>RootedCare</Text>
        </View>

        <Text style={[styles.version, { color: colors.textMuted }]}>Version 1.0.0</Text>

        <Text style={[styles.body, { color: colors.text }]}>
          RootedCare is your trusted companion for natural wellness, inspired by Ghanaian herbal traditions
          and supported by modern science. We believe that the wisdom of traditional herbal medicine,
          passed down through generations, deserves a place in today’s wellness journey.
        </Text>

        <Text style={[styles.body, { color: colors.text }]}>
          Our mission is to make safe, evidence-informed herbal knowledge accessible to everyone.
          Every herb in our library is researched with respect for both traditional use and
          contemporary clinical studies.
        </Text>

        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Heart size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Our Values</Text>
          <Text style={[styles.body, { color: colors.text, marginTop: 8 }]}>
            • Respect for traditional knowledge{'\n'}
            • Evidence-informed guidance{'\n'}
            • Safety first, always{'\n'}
            • Culturally grounded design{'\n'}
            • Accessible to all
          </Text>
        </View>

        <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
          Disclaimer: The information provided in this app is for educational purposes only and
          is not a substitute for professional medical advice. Always consult a healthcare provider
          before starting any herbal regimen, especially if you are pregnant, nursing, or on medication.
        </Text>
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
  content: { padding: 24, paddingBottom: 60 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 8 },
  appName: { fontFamily: 'Poppins_700Bold', fontSize: 28, letterSpacing: -0.5 },
  version: { fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center', marginBottom: 32 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 28, marginBottom: 20 },
  sectionCard: { borderRadius: 16, borderWidth: 1, padding: 20, marginBottom: 24, gap: 8 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 16 },
  disclaimer: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 16 },
});
