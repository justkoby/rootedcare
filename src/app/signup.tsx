import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { signUp } from '../services/auth';

export default function SignupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSignup() {
    const cleanEmail = email.trim().toLowerCase();

    const showAlert = (title: string, msg: string) => {
      if (Platform.OS === 'web') {
        alert(`${title}: ${msg}`);
      } else {
        Alert.alert(title, msg);
      }
    };

    if (!cleanEmail || !password || !confirmPassword) {
      showAlert('Missing information', 'Complete all fields.');
      return;
    }

    if (password.length < 6) {
      showAlert('Password too short', 'Your password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Passwords do not match', 'Enter the same password in both fields.');
      return;
    }

    try {
      setSubmitting(true);

      const result = await signUp(
        cleanEmail,
        password
      );

      if (!result.session) {
        showAlert(
          'Check your email',
          'We sent you a confirmation link. Confirm your email, then sign in.'
        );

        router.replace('/login');
        return;
      }

      router.replace('/');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to create your account.';

      showAlert('Sign-up failed', message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>
              Create your account
            </Text>

            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Save herbs and wellness content to My Care.
            </Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
            />

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
            />

            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
            />

            <Pressable
              onPress={handleSignup}
              disabled={submitting}
              style={[
                styles.button,
                { backgroundColor: colors.primary },
                submitting && styles.buttonDisabled,
              ]}
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>
                  Create account
                </Text>
              )}
            </Pressable>

            <Link href="/login" asChild>
              <Pressable style={styles.linkButton}>
                <Text style={[styles.linkText, { color: colors.primary }]}>
                  Already have an account? Sign in
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'System',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'System',
    marginBottom: 28,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 14,
    fontFamily: 'System',
  },
  button: {
    minHeight: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  linkButton: {
    alignItems: 'center',
    padding: 18,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
  },
});
