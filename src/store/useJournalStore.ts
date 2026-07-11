import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface JournalEntry {
  id: string;
  date: string;
  mood: string;
  notes: string;
  herbsTaken: string[];
  symptoms: string[];
  createdAt: string;
}

interface JournalState {
  entries: JournalEntry[];
  addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void;
  getEntriesByDate: (date: string) => JournalEntry[];
  getRecentEntries: (limit?: number) => JournalEntry[];
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (entry) =>
        set((state) => ({
          entries: [
            {
              ...entry,
              id: `journal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              createdAt: new Date().toISOString(),
            },
            ...state.entries,
          ],
        })),
      getEntriesByDate: (date) =>
        get().entries.filter((e) => e.date === date),
      getRecentEntries: (limit = 7) =>
        get().entries.slice(0, limit),
    }),
    {
      name: 'rootedcare-journal',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
