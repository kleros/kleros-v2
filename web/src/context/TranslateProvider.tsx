import React, { createContext, useCallback, useContext, useEffect, useMemo } from "react";

import { useLocalStorage } from "hooks/useLocalStorage";

export type SupportedLangs = "en" | "es" | "zh" | "fr" | "hi" | "ko" | "ja";

interface ITranslate {
  currentLang: SupportedLangs;
  setLang: (lang: SupportedLangs) => void;
}
const TranslateContext = createContext<ITranslate | undefined>(undefined);

export const useTranslate = () => {
  const context = useContext(TranslateContext);
  if (!context) {
    throw new Error("Context Provider not found.");
  }
  return context;
};

export const TranslateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLang] = useLocalStorage<SupportedLangs>("lang", "en");

  useEffect(() => {
    try {
      // Check if the Google Translate script is already in the document
      const existingScript = document.querySelector('script[src*="translate.google.com/translate_a/element.js"]');
      if (!existingScript) {
        const addScript = document.createElement("script");
        addScript.setAttribute("src", "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit");
        document.body.appendChild(addScript);

        //@ts-expect-error will exist
        window.googleTranslateElementInit = () => {
          //@ts-expect-error will exist
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,es,hi,ja,zh,fr,ko", // Include all languages you need here
            },
            "google_translate_element"
          );
        };
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log("Error injecting google translate script", err);
    }
  }, []);

  const setLang = useCallback(
    (cValue: SupportedLangs) => {
      setCurrentLang(cValue);
      document.cookie = "googtrans" + "=" + `/en/${cValue}` + ";" + "Session" + ";path=/";
      window.location.reload();
    },
    [setCurrentLang]
  );

  return (
    <TranslateContext.Provider value={useMemo(() => ({ currentLang, setLang }), [currentLang, setLang])}>
      <div id="google_translate_element"></div>
      {children}
    </TranslateContext.Provider>
  );
};

export default TranslateProvider;
