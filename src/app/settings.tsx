import React from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, StatusBar,
  useColorScheme, ScrollView, Pressable, Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, User, Lock, Shield, Bell, Mail, Globe } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useReminderStore } from '../store/useReminderStore';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const dailyEnabled = useReminderStore((s) => s.dailyEnabled);
  const setDailyEnabled = useReminderStore((s) => s.setDailyEnabled);

  const accountRows = [
    { icon: User, label: 'Edit Profile', route: null },
    { icon: Lock, label: 'Change Password', route: null },
    { icon: Shield, label: 'Privacy & Security', route: null },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.groupTitle, { color: colors.textMuted }]}>ACCOUNT</Text>
        {accountRows.map((item, i) => {
          const IconComp = item.icon;
          return (
            <Pressable
              key={i}
              style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => item.route && router.push(item.route as any)}
            >
              <IconComp size={18} color={colors.textMuted} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>{item.label}</Text>
              <ChevronLeft size={16} color={colors.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
            </Pressable>
          );
        })}

        <Text style={[styles.groupTitle, { color: colors.textMuted, marginTop: 28 }]}>NOTIFICATIONS</Text>
        <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Bell size={18} color={colors.textMuted} />
          <Text style={[styles.rowLabel, { color: colors.text }]}>Push Notifications</Text>
          <Switch
            value={dailyEnabled}
            onValueChange={setDailyEnabled}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>
        <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Mail size={18} color={colors.textMuted} />
          <Text style={[styles.rowLabel, { color: colors.text }]}>Weekly Digest</Text>
          <Switch
            value={true}
            onValueChange={() => {}}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>

        <Text style={[styles.groupTitle, { color: colors.textMuted, marginTop: 28 }]}>ABOUT</Text>
        <Pressable
          style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/about' as any)}
        >
          <Globe size={18} color={colors.textMuted} />
          <Text style={[styles.rowLabel, { color: colors.text }]}>About RootedCare</Text>
          <ChevronLeft size={16} color={colors.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
        </Pressable>
        <Pressable
          style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text style={[styles.rowLabel, { color: colors.text }]}>App Version</Text>
          <Text style={[styles.versionText, { color: colors.textMuted }]}>1.0.0</Text>
        </Pressable>
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
  scrollContent: { padding: 24, paddingBottom: 60 },
  groupTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12, letterSpacing: 0.5, marginBottom: 10 },
  row: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderRadius: 14, borderWidth: 1, marginBottom: 8, gap: 12,
  },
  rowLabel: { flex: 1, fontFamily: 'Poppins_500Medium', fontSize: 15 },
  versionText: { fontFamily: 'Inter_400Regular', fontSize: 14 },
});
