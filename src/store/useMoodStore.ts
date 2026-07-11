import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MoodState {
  todayMood: string | null;
  todayDate: string;
  setMood: (mood: string) => void;
  getMood: () => string | null;
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export const useMoodStore = create<MoodState>()(
  persist(
    (set, get) => ({
      todayMood: null,
      todayDate: getTodayKey(),
      setMood: (mood) =>
        set({ todayMood: mood, todayDate: getTodayKey() }),
      getMood: () => {
        const state = get();
        return state.todayDate === getTodayKey() ? state.todayMood : null;
      },
    }),
    {
      name: 'rootedcare-mood',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
