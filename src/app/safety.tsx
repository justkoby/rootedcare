import React from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, StatusBar,
  useColorScheme, ScrollView, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, AlertTriangle, ShieldCheck, Info } from 'lucide-react-native';
import { Colors } from '../constants/Colors';

interface SafetyItem { icon: 'shield' | 'alert' | 'info'; title: string; description: string }

const CATEGORIES = [
  {
    id: 'pregnancy', title: 'Pregnancy & Breastfeeding',
    items: [
      { icon: 'alert' as const, title: 'Avoid high-dose Neem', description: 'Neem bark or root extract may stimulate uterine contractions. Avoid during pregnancy.' },
      { icon: 'shield' as const, title: 'Ginger is generally safe', description: 'Small culinary amounts of ginger are considered safe during pregnancy for nausea relief.' },
      { icon: 'alert' as const, title: 'Consult before Hibiscus', description: 'High doses of Hibiscus may lower estrogen. Seek medical advice before use while breastfeeding.' },
    ],
  },
  {
    id: 'ttc', title: 'Trying to Conceive',
    items: [
      { icon: 'info' as const, title: 'Neem may affect fertility', description: 'Neem has traditionally been used as a contraceptive. Discontinue use when trying to conceive.' },
      { icon: 'shield' as const, title: 'Moringa supports nutrition', description: 'Moringa is rich in folate and iron, beneficial when preparing for pregnancy.' },
    ],
  },
  {
    id: 'conditions', title: 'Medical Conditions',
    items: [
      { icon: 'alert' as const, title: 'Blood pressure medications', description: 'Hibiscus (Sobolo) and Prekese may lower blood pressure. Use with caution alongside antihypertensives.' },
      { icon: 'alert' as const, title: 'Diabetes', description: 'Ginger and Moringa may lower blood sugar. Monitor levels closely if taking diabetic medication.' },
      { icon: 'info' as const, title: 'Blood thinners', description: 'Ginger has mild anticoagulant properties. Consult your doctor if on warfarin or aspirin therapy.' },
    ],
  },
  {
    id: 'interactions', title: 'Herb Interactions',
    items: [
      { icon: 'info' as const, title: 'Hibiscus + Paracetamol', description: 'Hibiscus may interact with how the body processes paracetamol (acetaminophen). Space them apart.' },
      { icon: 'shield' as const, title: 'Generally safe combinations', description: 'Ginger, Moringa, and Prekese can be safely combined in teas and soups in culinary amounts.' },
    ],
  },
  {
    id: 'guidelines', title: 'General Guidelines',
    items: [
      { icon: 'shield' as const, title: 'Start with small amounts', description: 'When trying a new herb, begin with small quantities to observe how your body responds.' },
      { icon: 'shield' as const, title: 'Choose quality sources', description: 'Purchase herbs from reputable, certified wellness shops or organic markets to ensure purity.' },
      { icon: 'info' as const, title: 'Herbs complement care', description: 'Natural remedies work best alongside — not instead of — professional medical advice and treatment.' },
    ],
  },
];

const IconComp = ({ type, color }: { type: SafetyItem['icon']; color: string }) => {
  if (type === 'shield') return <ShieldCheck size={18} color={color} />;
  if (type === 'alert') return <AlertTriangle size={18} color={color} />;
  return <Info size={18} color={color} />;
};

export default function SafetyScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  const iconColor = (type: SafetyItem['icon']) => {
    if (type === 'shield') return colors.success;
    if (type === 'alert') return colors.warning;
    return colors.secondary;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={[styles.navBar, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.text }]}>Safety & Precautions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Hero warning banner */}
        <View style={[styles.heroBanner, { backgroundColor: colors.warning + '22', borderColor: colors.warning + '55' }]}>
          <AlertTriangle size={20} color={colors.warning} />
          <Text style={[styles.heroText, { color: colors.text }]}>
            Always consult a healthcare professional if you’re unsure about using any herb.
          </Text>
        </View>

        {/* Safety categories */}
        {CATEGORIES.map(cat => (
          <View key={cat.id} style={styles.category}>
            <Pressable style={[styles.categoryHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.categoryTitle, { color: colors.text }]}>{cat.title}</Text>
              <ChevronRight size={18} color={colors.textMuted} />
            </Pressable>

            {cat.items.map((item, i) => (
              <View key={i} style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.itemIcon, { backgroundColor: iconColor(item.icon) + '20' }]}>
                  <IconComp type={item.icon} color={iconColor(item.icon)} />
                </View>
                <View style={styles.itemText}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.itemDesc, { color: colors.textMuted }]}>{item.description}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  navTitle: { flex: 1, textAlign: 'center', fontFamily: 'Poppins_600SemiBold', fontSize: 18 },
  scrollContent: { paddingBottom: 40, paddingTop: 20 },
  heroBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginHorizontal: 24, padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 28 },
  heroText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20 },
  category: { marginHorizontal: 24, marginBottom: 20 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 8 },
  categoryTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 16 },
  itemCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8, gap: 12 },
  itemIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  itemText: { flex: 1 },
  itemTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, marginBottom: 4 },
  itemDesc: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18 },
});
