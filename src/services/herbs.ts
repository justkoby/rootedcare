import { supabase } from '../lib/supabase';

export async function getHerbs() {
  const { data, error } = await supabase
    .from('herbs')
    .select('*')
    .eq('is_published', true)
    .limit(6);

  if (error) {
    console.error('Error fetching herbs:', error);
    throw error;
  }

  return data;
}
