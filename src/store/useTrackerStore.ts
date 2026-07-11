import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TrackerState {
  water: number;
  sleep: number;
  energy: number;
  date: string;
  setWater: (value: number) => void;
  setSleep: (value: number) => void;
  setEnergy: (value: number) => void;
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set) => ({
      water: 0,
      sleep: 0,
      energy: 0,
      date: getTodayKey(),
      setWater: (water) => set({ water, date: getTodayKey() }),
      setSleep: (sleep) => set({ sleep, date: getTodayKey() }),
      setEnergy: (energy) => set({ energy, date: getTodayKey() }),
    }),
    {
      name: 'rootedcare-tracker',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
