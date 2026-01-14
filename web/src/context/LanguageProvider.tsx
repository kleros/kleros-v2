import React, { createContext, useContext, useCallback, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

type Language = "en" | "es" | "fr";

interface LanguageContextValue {
  language: Language;
  changeLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const SUPPORTED_LANGUAGES: Language[] = ["en", "es", "fr"];

// Normalize and validate language code
const normalizeLanguage = (lng: string): Language => {
  // Direct match
  if (SUPPORTED_LANGUAGES.includes(lng as Language)) {
    return lng as Language;
  }

  // Try base language (e.g., "en-US" -> "en")
  const baseLang = lng.split("-")[0];
  if (SUPPORTED_LANGUAGES.includes(baseLang as Language)) {
    return baseLang as Language;
  }

  // Default to English
  return "en";
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState<Language>(normalizeLanguage(i18n.language));

  useEffect(() => {
    // Sync state with i18n language changes
    const handleLanguageChange = (lng: string) => {
      setLanguage(normalizeLanguage(lng));
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  const changeLanguage = useCallback(
    (lang: Language) => {
      i18n.changeLanguage(lang);
      setLanguage(lang);
    },
    [i18n]
  );

  return <LanguageContext.Provider value={{ language, changeLanguage }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
