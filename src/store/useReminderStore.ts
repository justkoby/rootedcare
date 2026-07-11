import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Reminder {
  id: string;
  herbId: string;
  label: string;
  time: string;
  days: string[];
  enabled: boolean;
}

interface ReminderState {
  reminders: Reminder[];
  dailyEnabled: boolean;
  setDailyEnabled: (enabled: boolean) => void;
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  toggleReminder: (reminderId: string) => void;
  removeReminder: (reminderId: string) => void;
}

export const useReminderStore = create<ReminderState>()(
  persist(
    (set) => ({
      reminders: [],
      dailyEnabled: false,
      setDailyEnabled: (enabled) => set({ dailyEnabled: enabled }),
      addReminder: (reminder) =>
        set((state) => ({
          reminders: [
            ...state.reminders,
            {
              ...reminder,
              id: `rem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            },
          ],
        })),
      toggleReminder: (reminderId) =>
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === reminderId ? { ...r, enabled: !r.enabled } : r
          ),
        })),
      removeReminder: (reminderId) =>
        set((state) => ({
          reminders: state.reminders.filter((r) => r.id !== reminderId),
        })),
    }),
    {
      name: 'rootedcare-reminders',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
