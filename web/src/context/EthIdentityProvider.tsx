import React from "react";

import { TransactionProvider, TransactionModal } from "ethereum-identity-kit";

import { useTooltipEscapeOverflow } from "hooks/useTooltipEscapeOverflow";

const EthIdentityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useTooltipEscapeOverflow();

  return (
    <TransactionProvider>
      {children}
      <TransactionModal />
    </TransactionProvider>
  );
};

export default EthIdentityProvider;
