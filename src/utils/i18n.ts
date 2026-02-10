import localesResource from '@assets/locales';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const LANGUAGE_KEY = '@app_language';

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void): Promise<void> => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage) {
        callback(savedLanguage);
      } else {
        // Get device language
        const deviceLanguage = getLocales()[0]?.languageCode ?? 'vi';
        // Support only 'vi' and 'en', fallback to 'vi' if not supported
        const supportedLanguage = deviceLanguage === 'en' ? 'en' : 'vi';
        callback(supportedLanguage);
      }
    } catch (error) {
      console.error('Error loading language:', error);
      callback('vi');
    }
  },
  init: (): void => {},
  cacheUserLanguage: async (lng: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lng);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  },
};

i18n
  .use(initReactI18next)
  .use(languageDetector)
  .init({
    resources: localesResource,
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
