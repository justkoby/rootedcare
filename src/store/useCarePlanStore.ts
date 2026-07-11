import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CarePlanEntry {
  id: string;
  herbId: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  label: string;
  purpose: string;
  notes: string;
  done: boolean;
  createdAt: string;
}

interface CarePlanState {
  entries: CarePlanEntry[];
  addEntry: (entry: Omit<CarePlanEntry, 'id' | 'createdAt' | 'done'>) => void;
  toggleDone: (entryId: string) => void;
  removeEntry: (entryId: string) => void;
  getTodayCount: () => { done: number; total: number };
}

export const useCarePlanStore = create<CarePlanState>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (entry) =>
        set((state) => ({
          entries: [
            ...state.entries,
            {
              ...entry,
              id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              done: false,
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      toggleDone: (entryId) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === entryId ? { ...e, done: !e.done } : e
          ),
        })),
      removeEntry: (entryId) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== entryId),
        })),
      getTodayCount: () => {
        const entries = get().entries;
        const done = entries.filter((e) => e.done).length;
        return { done, total: entries.length };
      },
    }),
    {
      name: 'rootedcare-careplan',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
