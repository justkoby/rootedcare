import { supabase } from '../lib/supabase';

export async function getWellnessItems() {
  const { data, error } = await supabase
    .from('wellness_concerns')
    .select('*')
    .eq('is_published', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching wellness items:', error);
    throw error;
  }

  return (data ?? []).map((item: any) => ({
    ...item,
    title: item.name,
    short_description: item.summary,
  }));
}

export async function getWellnessItemBySlug(slug: string) {
  const { data, error } = await supabase
    .from('wellness_concerns')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching wellness item:', error);
    throw error;
  }

  if (data) {
    return {
      ...data,
      title: data.name,
      short_description: data.summary,
      description: data.educational_guidance,
      precautions: data.red_flag_guidance,
      benefits: [], // fallback
      recommendations: [], // fallback
    };
  }

  return null;
}
