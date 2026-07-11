// scripts/test_supabase.js
// Run with: node scripts/test_supabase.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

let supabaseUrl = '';
let supabasePublishableKey = '';

// Simple manual parser for .env.local
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

if (!supabaseUrl || !supabasePublishableKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env.local');
  process.exit(1);
}

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Key prefix:', supabasePublishableKey.slice(0, 15) + '...');

const supabase = createClient(supabaseUrl, supabasePublishableKey);

async function test() {
  try {
    console.log('\nFetching from table "herbs"...');
    const { data, error } = await supabase
      .from('herbs')
      .select('*')
      .limit(6);

    if (error) {
      console.error('Supabase query error:', error);
      process.exit(1);
    }

    console.log('Query Succeeded!');
    console.log(`Returned ${data.length} rows.`);
    if (data.length > 0) {
      console.log('\nSample row fields:', Object.keys(data[0]));
      console.log('\nFirst row data:', JSON.stringify(data[0], null, 2));
    } else {
      console.log('The table "herbs" is empty.');
    }
  } catch (err) {
    console.error('Connection/Request failed:', err.message);
  }
}

test();
