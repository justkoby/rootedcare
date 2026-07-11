import { supabase } from '../lib/supabase';

export type Favorite = {
  id: string;
  user_id: string;
  item_type: 'herb' | 'wellness' | 'article';
  item_id: string;
  created_at: string;
};

export async function getFavorites(): Promise<Favorite[]> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }

  return data ?? [];
}

export async function addFavorite(
  itemType: 'herb' | 'wellness' | 'article',
  itemId: string
) {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  if (!userId) {
    throw new Error('You must be signed in to save items.');
  }

  const { error } = await supabase
    .from('favorites')
    .insert({
      user_id: userId,
      item_type: itemType,
      item_id: itemId,
    });

  if (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
}

export async function checkFavorite(
  itemType: 'herb' | 'wellness' | 'article',
  itemId: string
): Promise<boolean> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  if (!userId) {
    return false;
  }

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('item_type', itemType)
    .eq('item_id', itemId)
    .maybeSingle();

  if (error) {
    console.error('Error checking favorite:', error);
    return false;
  }

  return !!data;
}

export async function removeFavorite(
  itemType: 'herb' | 'wellness' | 'article',
  itemId: string
) {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  if (!userId) {
    throw new Error('You must be signed in to remove items.');
  }

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('item_type', itemType)
    .eq('item_id', itemId);

  if (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
}
