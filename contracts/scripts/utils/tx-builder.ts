// Transaction batch example: https://github.com/safe-global/safe-wallet-monorepo/blob/8bbf3b82edc347b70a038629cd9afd45eb1ed38a/apps/web/cypress/fixtures/test-working-batch.json

const governor = "0x66e8DE9B42308c6Ca913D1EE041d6F6fD037A57e";
const deployer = "0xf1C7c037891525E360C59f708739Ac09A7670c59";

export const template = ({ name, transactions }: { name: string; transactions: BuilderTransaction[] }) => ({
  version: "1.0",
  chainId: "42161", // Arbitrum One
  createdAt: Date.now(),
  meta: {
    name,
    description: "", // Not used because the Safe app doesn't show it
    txBuilderVersion: "1.18.0",
    createdFromSafeAddress: governor,
    createdFromOwnerAddress: deployer,
  },
  transactions,
});

export const transaction = ({
  to,
  value,
  data,
}: {
  to: string;
  value: bigint | undefined;
  data: string;
}): BuilderTransaction => ({
  to,
  value: value?.toString() ?? "0",
  data,
  contractMethod: null,
  contractInputsValues: null,
});

export interface BuilderTransaction {
  to: string;
  value: string;
  data: string;
  contractMethod: null;
  contractInputsValues: null;
}

export const transactionBuilderUrl = `https://app.safe.global/apps/open?safe=arb1:${governor}&appUrl=https%3A%2F%2Fapps-portal.safe.global%2Ftx-builder`;
