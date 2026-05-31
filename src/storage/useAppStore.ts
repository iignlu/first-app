import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  userName: string; // User's customized name
  currentPage: number; // Current page being read (2 to 49 for Surah Al-Baqarah)
  completedPages: number[]; // List of all completed page numbers
  dailyPagesRead: Record<string, number[]>; // Maps date strings (YYYY-MM-DD) to arrays of completed pages
  bookmarks: number[]; // Page numbers that are bookmarked
  fontSize: number;
  isDarkMode: boolean;
  notificationsEnabled: boolean;
  reminderTime: string; // HH:mm format
  streakDays: number;
  lastReadDate: string | null; // YYYY-MM-DD of the last reading
  
  // Actions
  setUserName: (name: string) => void;
  setCurrentPage: (page: number) => void;
  markPageAsRead: (page: number) => void;
  unmarkPageAsRead: (page: number) => void;
  toggleBookmark: (page: number) => void;
  setFontSize: (size: number) => void;
  setDarkMode: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setReminderTime: (time: string) => void;
  updateStreakOnOpen: () => void;
  resetProgress: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      userName: 'صديقي',
      currentPage: 2,
      completedPages: [],
      dailyPagesRead: {},
      bookmarks: [],
      fontSize: 24,
      isDarkMode: false,
      notificationsEnabled: true,
      reminderTime: '08:00',
      streakDays: 0,
      lastReadDate: null,

      setUserName: (name) => set({ userName: name.trim() || 'صديقي' }),

      setCurrentPage: (page) => {
        if (page >= 2 && page <= 49) {
          set({ currentPage: page });
        }
      },
      
      markPageAsRead: (pageNumber) => {
        const { completedPages, dailyPagesRead, streakDays, lastReadDate } = get();
        
        // 1. Add to completedPages if not already there
        const updatedCompleted = completedPages.includes(pageNumber)
          ? completedPages
          : [...completedPages, pageNumber].sort((a, b) => a - b);

        // 2. Add to dailyPagesRead
        const today = new Date().toISOString().split('T')[0];
        const todayRead = dailyPagesRead[today] || [];
        const updatedTodayRead = todayRead.includes(pageNumber)
          ? todayRead
          : [...todayRead, pageNumber];
          
        const updatedDailyPagesRead = {
          ...dailyPagesRead,
          [today]: updatedTodayRead
        };

        // 3. Streak calculation
        let newStreak = streakDays;
        if (lastReadDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (lastReadDate === yesterdayStr) {
            newStreak = streakDays + 1;
          } else {
            newStreak = 1;
          }
        }

        // 4. Auto advance currentPage if it matches the current page
        let nextCurrentPage = get().currentPage;
        if (pageNumber === get().currentPage && pageNumber < 49) {
          nextCurrentPage = pageNumber + 1;
        }

        set({
          completedPages: updatedCompleted,
          dailyPagesRead: updatedDailyPagesRead,
          streakDays: newStreak,
          lastReadDate: today,
          currentPage: nextCurrentPage,
        });
      },

      unmarkPageAsRead: (pageNumber) => {
        const { completedPages, dailyPagesRead } = get();
        
        // Remove from completed
        const updatedCompleted = completedPages.filter((p) => p !== pageNumber);
        
        // Remove from dailyPagesRead
        const updatedDailyPagesRead = { ...dailyPagesRead };
        for (const date in updatedDailyPagesRead) {
          updatedDailyPagesRead[date] = updatedDailyPagesRead[date].filter((p) => p !== pageNumber);
          if (updatedDailyPagesRead[date].length === 0) {
            delete updatedDailyPagesRead[date];
          }
        }

        set({
          completedPages: updatedCompleted,
          dailyPagesRead: updatedDailyPagesRead,
        });
      },
      
      toggleBookmark: (pageNumber) => {
        const { bookmarks } = get();
        if (bookmarks.includes(pageNumber)) {
          set({ bookmarks: bookmarks.filter((p) => p !== pageNumber) });
        } else {
          set({ bookmarks: [...bookmarks, pageNumber].sort((a, b) => a - b) });
        }
      },

      setFontSize: (size) => set({ fontSize: size }),
      setDarkMode: (enabled) => set({ isDarkMode: enabled }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setReminderTime: (time) => set({ reminderTime: time }),

      updateStreakOnOpen: () => {
        const { lastReadDate, streakDays } = get();
        if (!lastReadDate) return;

        const today = new Date().toISOString().split('T')[0];
        if (lastReadDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // If the last read date is older than yesterday, the streak is broken
        if (lastReadDate !== yesterdayStr) {
          set({ streakDays: 0 });
        }
      },

      resetProgress: () => set({ 
        currentPage: 2, 
        completedPages: [], 
        dailyPagesRead: {}, 
        bookmarks: [], 
        streakDays: 0, 
        lastReadDate: null 
      }),
    }),
    {
      name: 'al-baqara-page-storage-v2',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
