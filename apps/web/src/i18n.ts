import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "./locales/en/translation";
import translationFR from "./locales/fr/translation";

export const defaultNS = "translation";
export const resources = {
  en: { translation: translationEN },
  fr: { translation: translationFR },
} as const;

const i18n = createInstance();

i18n.use(initReactI18next).init({
  lng: localStorage.getItem("language") || "en",
  fallbackLng: "en",
  defaultNS,
  resources,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
