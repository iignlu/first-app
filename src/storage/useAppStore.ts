import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  lastAyahIndex: number;
  bookmarks: number[];
  fontSize: number;
  isDarkMode: boolean;
  notificationsEnabled: boolean;
  reminderTime: string; // HH:mm format
  streakDays: number;
  lastReadDate: string | null;
  
  // Actions
  setLastAyahIndex: (index: number) => void;
  toggleBookmark: (index: number) => void;
  setFontSize: (size: number) => void;
  setDarkMode: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setReminderTime: (time: string) => void;
  updateStreak: () => void;
  resetProgress: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      lastAyahIndex: 0,
      bookmarks: [],
      fontSize: 24,
      isDarkMode: false,
      notificationsEnabled: true,
      reminderTime: '08:00',
      streakDays: 0,
      lastReadDate: null,

      setLastAyahIndex: (index) => set({ lastAyahIndex: index }),
      
      toggleBookmark: (index) => {
        const { bookmarks } = get();
        if (bookmarks.includes(index)) {
          set({ bookmarks: bookmarks.filter((i) => i !== index) });
        } else {
          set({ bookmarks: [...bookmarks, index] });
        }
      },

      setFontSize: (size) => set({ fontSize: size }),
      setDarkMode: (enabled) => set({ isDarkMode: enabled }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setReminderTime: (time) => set({ reminderTime: time }),

      updateStreak: () => {
        const { lastReadDate, streakDays } = get();
        const today = new Date().toISOString().split('T')[0];
        
        if (lastReadDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastReadDate === yesterdayStr) {
          set({ streakDays: streakDays + 1, lastReadDate: today });
        } else {
          set({ streakDays: 1, lastReadDate: today });
        }
      },

      resetProgress: () => set({ lastAyahIndex: 0, streakDays: 0, lastReadDate: null }),
    }),
    {
      name: 'al-baqara-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
