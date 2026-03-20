import React from "react";

import { TransactionProvider, TransactionModal, TranslationProvider } from "ethereum-identity-kit";
import { useTranslation } from "react-i18next";

import { useTooltipEscapeOverflow } from "hooks/useTooltipEscapeOverflow";

const EthIdentityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  useTooltipEscapeOverflow();

  const translateFn = (key: string, defaultValue?: string) => {
    const translated = t(`ethid.${key}`, { defaultValue: "" });
    return translated || defaultValue || key;
  };

  return (
    <TranslationProvider translateFn={translateFn} activeLanguage={i18n.language} fallbackLanguage="en">
      <TransactionProvider>
        {children}
        <TransactionModal />
      </TransactionProvider>
    </TranslationProvider>
  );
};

export default EthIdentityProvider;
