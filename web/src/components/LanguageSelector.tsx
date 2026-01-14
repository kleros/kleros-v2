import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import { useLanguage } from "context/LanguageProvider";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 0 16px 0;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.primaryText};
`;

const LanguageOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const LanguageButton = styled.button<{ $isActive: boolean }>`
  padding: 10px 20px;
  border-radius: 8px;
  border: 2px solid ${({ theme, $isActive }) => ($isActive ? theme.primaryBlue : theme.stroke)};
  background-color: ${({ theme, $isActive }) => ($isActive ? theme.mediumBlue : theme.whiteBackground)};
  color: ${({ theme, $isActive }) => ($isActive ? theme.primaryBlue : theme.secondaryText)};
  font-weight: ${({ $isActive }) => ($isActive ? "600" : "400")};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    border-color: ${({ theme }) => theme.primaryBlue};
    background-color: ${({ theme }) => theme.mediumBlue};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const Flag = styled.span`
  font-size: 20px;
`;

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇦🇷" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
] as const;

export const LanguageSelector: React.FC = () => {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();

  return (
    <Container>
      <Label>{t("misc.language")}</Label>
      <LanguageOptions>
        {languages.map((lang) => (
          <LanguageButton
            key={lang.code}
            $isActive={language === lang.code}
            onClick={() => changeLanguage(lang.code as "en" | "es" | "fr")}
          >
            <Flag>{lang.flag}</Flag>
            {lang.name}
          </LanguageButton>
        ))}
      </LanguageOptions>
    </Container>
  );
};
