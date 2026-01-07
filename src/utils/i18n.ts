import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import localesResource from '../assets/locales';

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: (callback: (lng: string) => void): void => {
    const locale = Localization.getLocales()[0]?.languageCode ?? 'vi';
    callback(locale);
  },
  init: (): void => {},
  cacheUserLanguage: (): void => {},
};

i18n
  .use(initReactI18next)
  .use(languageDetector)
  .init({
    resources: localesResource,
    fallbackLng: 'vi',
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
