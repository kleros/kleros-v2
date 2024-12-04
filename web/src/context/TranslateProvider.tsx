import React, { createContext, useCallback, useContext, useEffect, useMemo } from "react";

import { useLocalStorage } from "hooks/useLocalStorage";

export type SupportedLangs = "en" | "es" | "fr" | "hi" | "ko" | "ja";

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
      const existingScript = document.querySelector('script[src*="translate.google.com/translate_a/element.js"]');
      if (!existingScript) {
        const addScript = document.createElement("script");
        addScript.setAttribute("src", "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit");
        document.body.appendChild(addScript);

        window.googleTranslateElementInit = () => {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,es,hi,ja,fr,ko",
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
      if (window.google?.translate?.TranslateElement) {
        const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
        if (select) {
          select.value = cValue;

          select.dispatchEvent(new Event("change", { bubbles: true }));
          select.click();
        }
      }
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
