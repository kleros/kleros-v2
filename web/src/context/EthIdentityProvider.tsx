import React from "react";

import { TransactionProvider, TransactionModal } from "ethereum-identity-kit";

const EthIdentityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <TransactionProvider>
      {children}
      <TransactionModal />
    </TransactionProvider>
  );
};

export default EthIdentityProvider;
