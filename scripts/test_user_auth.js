// scripts/test_user_auth.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

let supabaseUrl = '';
let supabasePublishableKey = '';

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      if (key === 'VITE_SUPABASE_URL') supabaseUrl = val;
      if (key === 'VITE_SUPABASE_PUBLISHABLE_KEY') supabasePublishableKey = val;
    }
  });
}

const supabase = createClient(supabaseUrl, supabasePublishableKey);

async function run() {
  const testEmail = `testuser_${Date.now()}@gmail.com`;
  const testPassword = 'Password123!';

  try {
    console.log('Attempting to register user with email:', testEmail);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (signUpError) {
      console.error('Sign-up failed:', signUpError.message);
      process.exit(1);
    }

    console.log('Sign-up succeeded!');
    console.log('User ID:', signUpData.user ? signUpData.user.id : 'No user returned');
    console.log('Session:', signUpData.session ? 'Session active' : 'Session null (email confirmation required)');

    // Attempt to login if session was returned or email confirmation is disabled
    if (signUpData.session) {
      console.log('\nAttempting to sign in with same credentials...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (signInError) {
        console.error('Sign-in failed:', signInError.message);
        process.exit(1);
      }
      console.log('Sign-in succeeded! User ID:', signInData.user.id);
    }
  } catch (err) {
    console.error('System failure:', err.message);
    process.exit(1);
  }
}

run();
