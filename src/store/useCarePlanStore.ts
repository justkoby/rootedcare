import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

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
  loadCarePlan: (userId: string) => Promise<void>;
  addEntry: (entry: Omit<CarePlanEntry, 'id' | 'createdAt' | 'done'>, userId?: string | null) => Promise<void>;
  toggleDone: (entryId: string, userId?: string | null) => Promise<void>;
  removeEntry: (entryId: string, userId?: string | null) => Promise<void>;
  getTodayCount: () => { done: number; total: number };
}

export const useCarePlanStore = create<CarePlanState>()(
  persist(
    (set, get) => ({
      entries: [],
      loadCarePlan: async (userId) => {
        try {
          const { data, error } = await supabase
            .from('user_care_plan')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

          if (error) {
            console.warn('Supabase care plan not found or error, using local:', error.message);
            return;
          }

          if (data) {
            set({
              entries: data.map((row: any) => ({
                id: row.id,
                herbId: row.herb_id,
                timeOfDay: row.time_of_day,
                label: row.label,
                purpose: row.purpose,
                notes: row.notes || '',
                done: row.done || false,
                createdAt: row.created_at,
              })),
            });
          }
        } catch (err: any) {
          console.warn('Failed to load care plan from Supabase, using local:', err.message || err);
        }
      },
      addEntry: async (entry, userId) => {
        const newId = `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const createdAt = new Date().toISOString();
        const localEntry: CarePlanEntry = {
          ...entry,
          id: newId,
          done: false,
          createdAt,
        };

        set((state) => ({
          entries: [...state.entries, localEntry],
        }));

        if (userId) {
          try {
            const { error } = await supabase
              .from('user_care_plan')
              .insert({
                id: newId,
                user_id: userId,
                herb_id: entry.herbId,
                time_of_day: entry.timeOfDay,
                label: entry.label,
                purpose: entry.purpose,
                notes: entry.notes,
                done: false,
                created_at: createdAt,
              });
            if (error) throw error;
          } catch (err: any) {
            console.warn('Failed to sync new care plan entry to Supabase:', err.message);
          }
        }
      },
      toggleDone: async (entryId, userId) => {
        let currentDone = false;
        set((state) => {
          const updated = state.entries.map((e) => {
            if (e.id === entryId) {
              currentDone = !e.done;
              return { ...e, done: currentDone };
            }
            return e;
          });
          return { entries: updated };
        });

        if (userId) {
          try {
            const { error } = await supabase
              .from('user_care_plan')
              .update({ done: currentDone })
              .eq('id', entryId)
              .eq('user_id', userId);
            if (error) throw error;
          } catch (err: any) {
            console.warn('Failed to sync care plan toggle to Supabase:', err.message);
          }
        }
      },
      removeEntry: async (entryId, userId) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== entryId),
        }));

        if (userId) {
          try {
            const { error } = await supabase
              .from('user_care_plan')
              .delete()
              .eq('id', entryId)
              .eq('user_id', userId);
            if (error) throw error;
          } catch (err: any) {
            console.warn('Failed to sync care plan removal to Supabase:', err.message);
          }
        }
      },
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
