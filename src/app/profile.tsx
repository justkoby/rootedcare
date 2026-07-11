import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  useFocusEffect,
  useRouter,
} from 'expo-router';

import { useAuth } from '../context/AuthContext';
import { getFavorites } from '../services/favorites';
import { signOut } from '../services/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [savedCount, setSavedCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function loadSavedCount() {
        if (!user) {
          setSavedCount(0);
          return;
        }

        try {
          setLoadingCount(true);

          const favorites = await getFavorites();

          setSavedCount(favorites.length);
        } catch (error) {
          console.error(
            'Unable to load saved count:',
            error
          );
        } finally {
          setLoadingCount(false);
        }
      }

      loadSavedCount();
    }, [user])
  );

  function handleSignOut() {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            try {
              setSigningOut(true);

              await signOut();

              router.replace('/login');
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : 'Unable to sign out.';

              Alert.alert(
                'Sign-out failed',
                message
              );
            } finally {
              setSigningOut(false);
            }
          },
        },
      ]
    );
  }

  if (authLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Your profile</Text>

        <Text style={styles.message}>
          Sign in to manage your RootedCare account
          and saved items.
        </Text>

        <Pressable
          onPress={() => router.push('/login' as any)}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>
            Sign in
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/signup' as any)}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>
            Create account
          </Text>
        </Pressable>
      </View>
    );
  }

  const email = user.email ?? 'No email available';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your profile</Text>

      <View style={styles.accountCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {email.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.accountContent}>
          <Text style={styles.accountLabel}>
            Signed in as
          </Text>

          <Text style={styles.email}>
            {email}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => router.push('/my-care' as any)}
        style={styles.menuCard}
      >
        <View>
          <Text style={styles.menuTitle}>
            My Care
          </Text>

          <Text style={styles.menuDescription}>
            View your saved herbs and wellness guides
          </Text>
        </View>

        {loadingCount ? (
          <ActivityIndicator size="small" />
        ) : (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {savedCount}
            </Text>
          </View>
        )}
      </Pressable>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>
          RootedCare
        </Text>

        <Text style={styles.infoText}>
          Educational herbal and wellness information
          inspired by traditional Ghanaian knowledge.
        </Text>
      </View>

      <Pressable
        onPress={handleSignOut}
        disabled={signingOut}
        style={[
          styles.signOutButton,
          signingOut && styles.disabledButton,
        ]}
      >
        {signingOut ? (
          <ActivityIndicator color="#98542f" />
        ) : (
          <Text style={styles.signOutText}>
            Sign out
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 64,
    paddingHorizontal: 20,
    backgroundColor: '#faf7f2',
  },
  center: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#faf7f2',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#252525',
    marginBottom: 24,
  },
  message: {
    maxWidth: 320,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#707070',
    marginBottom: 24,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#98542f',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  accountContent: {
    flex: 1,
    marginLeft: 14,
  },
  accountLabel: {
    fontSize: 13,
    color: '#777777',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: '#252525',
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#252525',
    marginBottom: 5,
  },
  menuDescription: {
    maxWidth: 260,
    fontSize: 14,
    lineHeight: 20,
    color: '#777777',
  },
  countBadge: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#efe2d8',
  },
  countText: {
    color: '#98542f',
    fontWeight: '700',
  },
  infoCard: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    color: '#252525',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#777777',
  },
  primaryButton: {
    width: '100%',
    maxWidth: 320,
    minHeight: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#98542f',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 12,
    padding: 14,
  },
  secondaryButtonText: {
    color: '#98542f',
    fontSize: 15,
    fontWeight: '600',
  },
  signOutButton: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: '#98542f',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  signOutText: {
    color: '#98542f',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
