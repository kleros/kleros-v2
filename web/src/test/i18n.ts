import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslation from "../locales/en/translation.json";

/** English-only i18n, no language detection, so tests can query by the copy users see. */
i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  resources: { en: { translation: enTranslation } },
  interpolation: { escapeValue: false },
});

export default i18n;
