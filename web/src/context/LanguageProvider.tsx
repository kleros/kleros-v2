import React, { createContext, useContext, useCallback, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

type Language = "en" | "es";

interface LanguageContextValue {
  language: Language;
  changeLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState<Language>((i18n.language as Language) || "en");

  useEffect(() => {
    // Sync state with i18n language changes
    const handleLanguageChange = (lng: string) => {
      setLanguage(lng as Language);
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
