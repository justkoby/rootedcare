import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

interface FavoriteState {
  favorites: string[];
  loadFavorites: (userId: string) => Promise<void>;
  toggleFavorite: (herbId: string, userId?: string | null) => Promise<void>;
  isFavorite: (herbId: string) => boolean;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favorites: [],
      loadFavorites: async (userId) => {
        try {
          const { data, error } = await supabase
            .from('user_favorites')
            .select('herb_id')
            .eq('user_id', userId);

          if (error) {
            console.warn('Supabase favorites not found or error, using local:', error.message);
            return;
          }

          if (data) {
            set({ favorites: data.map((row: any) => row.herb_id) });
          }
        } catch (err: any) {
          console.warn('Failed to load favorites from Supabase, using local:', err.message || err);
        }
      },
      toggleFavorite: async (herbId, userId) => {
        const currentFavorites = get().favorites;
        const exists = currentFavorites.includes(herbId);
        
        // Update local state first for instant UI response
        const newFavorites = exists
          ? currentFavorites.filter((id) => id !== herbId)
          : [...currentFavorites, herbId];
        
        set({ favorites: newFavorites });

        // If user is authenticated, sync with Supabase
        if (userId) {
          try {
            if (exists) {
              const { error } = await supabase
                .from('user_favorites')
                .delete()
                .eq('user_id', userId)
                .eq('herb_id', herbId);
              if (error) throw error;
            } else {
              const { error } = await supabase
                .from('user_favorites')
                .insert({ user_id: userId, herb_id: herbId });
              if (error) throw error;
            }
          } catch (err: any) {
            console.warn('Failed to sync favorite with Supabase:', err.message);
          }
        }
      },
      isFavorite: (herbId) => get().favorites.includes(herbId),
    }),
    {
      name: 'rootedcare-favorites',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
