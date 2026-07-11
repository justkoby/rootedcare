import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoriteState {
  favorites: string[];
  toggleFavorite: (herbId: string) => void;
  isFavorite: (herbId: string) => boolean;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (herbId) =>
        set((state) => ({
          favorites: state.favorites.includes(herbId)
            ? state.favorites.filter((id) => id !== herbId)
            : [...state.favorites, herbId],
        })),
      isFavorite: (herbId) => get().favorites.includes(herbId),
    }),
    {
      name: 'rootedcare-favorites',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
