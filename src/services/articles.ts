import { supabase } from '../lib/supabase';

const CATEGORY_MAP: Record<string, string> = {
  'ab92b007-61ed-4358-85f6-dd88d1944f3c': 'Wellness',
  '9ec8b607-7bd5-4c3e-ac39-744ed17ffcb6': 'Cycle',
  '9ff53db2-6922-4a12-b585-6f8fda48b4ff': 'Herbs',
  '6ff33bf1-64f2-4038-b139-7a60f62488c2': 'Wellness',
  'd0ea171f-3480-42c9-82f3-4a53a8717425': 'Nutrition',
};

export async function getArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }

  return (data ?? []).map((item: any) => ({
    ...item,
    tag: CATEGORY_MAP[item.category_id] || 'Wellness',
    excerpt: item.summary,
    short_description: item.summary,
    image_url: item.cover_image_url,
    category: CATEGORY_MAP[item.category_id] || 'Wellness',
    read_time: item.reading_time_minutes,
    reading_time: item.reading_time_minutes,
    author: item.author_name,
  }));
}

export async function getArticleBySlug(slug: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching article:', error);
    throw error;
  }

  if (data) {
    return {
      ...data,
      tag: CATEGORY_MAP[data.category_id] || 'Wellness',
      excerpt: data.summary,
      short_description: data.summary,
      image_url: data.cover_image_url,
      category: CATEGORY_MAP[data.category_id] || 'Wellness',
      read_time: data.reading_time_minutes,
      reading_time: data.reading_time_minutes,
      author: data.author_name,
    };
  }

  return null;
}
