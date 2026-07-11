// scripts/test_wellness.js
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

async function test() {
  try {
    console.log('Fetching from table "wellness_concerns"...');
    const { data, error } = await supabase
      .from('wellness_concerns')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Error fetching wellness_concerns:', error);
      process.exit(1);
    }

    console.log('Query Succeeded! Rows returned:', data.length);
    if (data.length > 0) {
      console.log('Sample row fields:', Object.keys(data[0]));
      console.log('First row data:', JSON.stringify(data[0], null, 2));
    }
  } catch (err) {
    console.error('Failed:', err.message);
  }
}

test();
