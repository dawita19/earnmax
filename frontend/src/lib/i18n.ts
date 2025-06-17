// src/lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      'welcome.admin.high': 'Welcome Boss',
      'welcome.admin.low': 'Welcome Management Team',
      'vip.level': 'VIP Level {{level}}',
      'withdrawal.min': 'Minimum withdrawal: {{amount}}',
      // Add all other translations
    }
  },
  am: {
    translation: {
      'welcome.admin.high': 'እንኳን ደህና መጣህ አለቃ',
      'welcome.admin.low': 'እንኳን ደህና መጣችሁ የምሥራች ቡድን',
      // Amharic translations
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;