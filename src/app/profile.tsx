import React from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, StatusBar,
  useColorScheme, ScrollView, Pressable, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import {
  Home as HomeIcon, Search, Calendar, BookOpen, User,
  ChevronRight, ClipboardList, Bell, BookMarked, BookOpen as BookOpenIcon,
  Settings as SettingsIcon, Heart, LogOut, BookText, Info, Leaf,
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { AnimatedTabBar, StaggerFadeIn } from '../components/animations';
import { useAuthStore } from '../store/useAuthStore';

const TAB_CONFIG = [
  { key: 'home',     icon: <HomeIcon />,   label: 'Home'    },
  { key: 'explore',  icon: <Search />,     label: 'Explore' },
  { key: 'my-care',  icon: <Calendar />,   label: 'My Care' },
  { key: 'learn',    icon: <BookOpen />,    label: 'Library' },
  { key: 'profile',  icon: <User />,       label: 'Profile' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const name = useAuthStore((s) => s.name);
  const interests = useAuthStore((s) => s.interests);

  const menuItems = [
    { icon: ClipboardList, label: 'My Care Plan', route: '/my-care-plan' },
    { icon: Bell, label: 'Reminders', route: '/reminders' },
    { icon: Heart, label: 'Saved Herbs', route: '/saved-herbs' },
    { icon: BookText, label: 'Wellness Journal', route: '/journal' },
    { icon: BookOpenIcon, label: 'My Articles', route: '/learn' },
    { icon: Leaf, label: 'Health Preferences', route: '/health-preferences' },
    { icon: Info, label: 'About RootedCare', route: '/about' },
    { icon: SettingsIcon, label: 'Settings', route: '/settings' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInUp.duration(400).springify()}>
          <View style={[styles.profileCard, { backgroundColor: colors.primary }]}>
            <View style={styles.avatarWrapper}>
              <View style={[styles.avatarPlaceholder, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <User size={40} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.profileName}>{name}</Text>
            <Pressable
              style={[styles.editBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
              onPress={() => router.push('/settings' as any)}
            >
              <Text style={styles.editLabel}>Edit Profile</Text>
            </Pressable>
            {interests.length > 0 && (
              <View style={styles.interestRow}>
                {interests.slice(0, 3).map((i) => (
                  <View key={i} style={styles.interestChip}>
                    <Text style={styles.interestText}>{i.replace('-', ' ')}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).duration(400).springify()} style={styles.menuSection}>
          {menuItems.slice(0, 4).map((item, i) => {
            const IconComp = item.icon;
            return (
              <Pressable
                key={i}
                style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(item.route as any)}
              >
                <View style={[styles.menuIconWrapper, { backgroundColor: colors.border }]}>
                  <IconComp size={18} color={colors.primary} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                <ChevronRight size={16} color={colors.textMuted} />
              </Pressable>
            );
          })}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(400).springify()} style={styles.menuSection}>
          {menuItems.slice(4).map((item, i) => {
            const IconComp = item.icon;
            return (
              <Pressable
                key={i}
                style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(item.route as any)}
              >
                <View style={[styles.menuIconWrapper, { backgroundColor: colors.border }]}>
                  <IconComp size={18} color={colors.primary} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                <ChevronRight size={16} color={colors.textMuted} />
              </Pressable>
            );
          })}
        </Animated.View>
      </ScrollView>

      <AnimatedTabBar
        tabs={TAB_CONFIG}
        activeTab="profile"
        onTabPress={(key) => {
          const routes: Record<string, string> = {
            home: '/home', explore: '/explore', 'my-care': '/my-care-plan',
            learn: '/learn', profile: '/profile',
          };
          if (routes[key] && key !== 'profile') router.push(routes[key] as any);
        }}
        colors={{ primary: colors.primary, textMuted: colors.textMuted, card: colors.card, border: colors.border }}
        theme={theme}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  profileCard: { margin: 24, borderRadius: 28, padding: 28, alignItems: 'center' },
  avatarWrapper: { marginBottom: 12 },
  avatarPlaceholder: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center' },
  profileName: { fontFamily: 'Poppins_600SemiBold', fontSize: 22, color: '#FFFFFF', marginBottom: 12 },
  editBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  editLabel: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#FFFFFF' },
  interestRow: { flexDirection: 'row', gap: 6, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' },
  interestChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)' },
  interestText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#FFFFFF', textTransform: 'capitalize' },
  menuSection: { paddingHorizontal: 24, marginBottom: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 8, gap: 12 },
  menuIconWrapper: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontFamily: 'Poppins_500Medium', fontSize: 15 },
});
