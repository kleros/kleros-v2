import React from "react";

import { useTranslation } from "react-i18next";

import { useLanguage } from "context/LanguageProvider";
import { cn } from "utils/cn";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇦🇷" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
] as const;

export const LanguageSelector: React.FC = () => {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="flex flex-col gap-3 p-[0_0_16px_0]">
      <label className="text-[14px] font-semibold text-klerosUIComponentsPrimaryText text-center">
        {t("misc.language")}
      </label>
      <div className="grid [grid-template-columns:repeat(auto-fit,_minmax(136px,_1fr))] gap-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            className={cn(
              "flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-solid px-5 py-2.5",
              "text-[14px] transition-all duration-200 ease-[ease] hover:border-klerosUIComponentsPrimaryBlue",
              "hover:bg-klerosUIComponentsMediumBlue disabled:cursor-not-allowed disabled:opacity-50",
              language === lang.code
                ? "border-klerosUIComponentsPrimaryBlue bg-klerosUIComponentsMediumBlue font-semibold text-klerosUIComponentsPrimaryBlue"
                : "border-klerosUIComponentsStroke bg-klerosUIComponentsWhiteBackground font-normal text-klerosUIComponentsSecondaryText"
            )}
            onClick={() => changeLanguage(lang.code as "en" | "es" | "fr")}
          >
            <span className="text-[20px]">{lang.flag}</span>
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
};
