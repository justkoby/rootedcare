// scripts/inspect_db_schema.js
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
  const tablesToTry = [
    'favorites',
    'user_favorites',
    'saved_herbs',
    'care_plans',
    'care_plan',
    'user_care_plans',
    'user_saved_herbs',
    'user_care_plan_herbs',
    'user_care_plan'
  ];

  for (const table of tablesToTry) {
    try {
      console.log(`Checking table "${table}"...`);
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`- Table "${table}" error:`, error.message);
      } else {
        console.log(`- SUCCESS! Table "${table}" exists. Sample columns:`, data.length > 0 ? Object.keys(data[0]) : '(empty table)');
      }
    } catch (err) {
      console.log(`- Table "${table}" failed:`, err.message);
    }
  }
}

test();
