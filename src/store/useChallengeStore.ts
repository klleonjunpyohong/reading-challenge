import { create } from 'zustand';

interface ChallengeState {
  challengeType: '100days_33books' | '365days_100expert';
  isFeverMode: boolean;
  streak: number;
  darkMode: boolean;
  setChallengeType: (type: '100days_33books' | '365days_100expert') => void;
  setFeverMode: (mode: boolean) => void;
  setStreak: (streak: number) => void;
  setDarkMode: (mode: boolean) => void;
}

export const useChallengeStore = create<ChallengeState>((set) => ({
  challengeType: '100days_33books',
  isFeverMode: false,
  streak: 0,
  darkMode: false,
  setChallengeType: (type) => set({ challengeType: type }),
  setFeverMode: (mode) => set({ isFeverMode: mode }),
  setStreak: (streak) => set({ streak, isFeverMode: streak >= 7 }),
  setDarkMode: (mode) => set({ darkMode: mode }),
}));
