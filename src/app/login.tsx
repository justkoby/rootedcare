import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { signIn } from '../services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  async function handleLogin() {
    console.log('Sign in pressed');

    const cleanEmail = email.trim().toLowerCase();

    setMessage('');

    if (!cleanEmail || !password) {
      setMessage('Please enter your email and password.');
      return;
    }

    try {
      setSubmitting(true);
      setMessage('Signing in...');

      await signIn(cleanEmail, password);

      console.log('SIGN IN SUCCESS');
      setMessage('Signed in successfully.');

      router.replace('/');
    } catch (error) {
      console.error('SIGN IN ERROR:', error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unable to sign in. Check your credentials.';

      setMessage(errorMessage);
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
              Welcome back
            </Text>

            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Sign in to manage your care plan and saved herbs.
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

            <Pressable
              onPress={handleLogin}
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
                  Sign in
                </Text>
              )}
            </Pressable>

            {!!message && (
              <Text
                style={{
                  marginTop: 14,
                  textAlign: 'center',
                  fontSize: 14,
                  lineHeight: 20,
                  color: '#8f5032',
                }}
              >
                {message}
              </Text>
            )}

            <Link href="/signup" asChild>
              <Pressable style={styles.linkButton}>
                <Text style={[styles.linkText, { color: colors.primary }]}>
                  Don't have an account? Sign up
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
