import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  name: string;
  interests: string[];
  isOnboarded: boolean;
  setName: (name: string) => void;
  setInterests: (interests: string[]) => void;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      name: 'Ama',
      interests: [],
      isOnboarded: false,
      setName: (name) => set({ name }),
      setInterests: (interests) => set({ interests }),
      completeOnboarding: () => set({ isOnboarded: true }),
    }),
    {
      name: 'rootedcare-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
