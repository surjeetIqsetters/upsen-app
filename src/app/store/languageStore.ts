import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '@app/utils/constants';

type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ar';

interface LanguageState {
  currentLanguage: LanguageCode;
  isRTL: boolean;
  setLanguage: (language: LanguageCode) => Promise<void>;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: 'en',
      isRTL: false,

      setLanguage: async (language) => {
        const isRTL = language === 'ar';
        set({ currentLanguage: language, isRTL });
      },
    }),
    {
      name: StorageKeys.authUser + '_language',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ currentLanguage: state.currentLanguage }),
    }
  )
);
