import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en.json';
import id from '../locales/id.json';

export type AppLanguage = 'en' | 'id';

const deviceLanguage = Localization.getLocales()[0]?.languageCode;
export const defaultLanguage: AppLanguage = deviceLanguage === 'id' ? 'id' : 'en';

void i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  fallbackLng: 'en',
  lng: defaultLanguage,
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: { translation: en },
    id: { translation: id },
  },
});

export function speechLanguageFor(language: string) {
  return language.startsWith('id') ? 'id-ID' : 'en-US';
}

export default i18n;
