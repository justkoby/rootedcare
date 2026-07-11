import { createClient } from '@supabase/supabase-js';

// Polyfill import.meta.env for Metro/Expo bundler compatibility
if (typeof (import.meta as any).env === 'undefined') {
  (import.meta as any).env = {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://lorhtrsyaaepmmffjogj.supabase.co',
    VITE_SUPABASE_PUBLISHABLE_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_bkJO8B37tBn7xkraNhEaxg_zO3c6_lz',
  };
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);
