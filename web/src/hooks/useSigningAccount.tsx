import { useLocalStorage } from "react-use";
import { Hex, keccak256 } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import messages from "consts/eip712-messages";
import { useWallet, WalletProviderHook } from "context/walletProviders";
import { isUndefined } from "utils/index";

const useSigningAccount = () => {
  const { account, signTypedData } = useWallet();
  const key = `signingAccount-${account}`;
  const [signingKey, setSigningKey] = useLocalStorage<Hex>(key);
  console.log("useSigningAccount", { account, key, signingKey });
  return {
    signingAccount: !isUndefined(signingKey) ? privateKeyToAccount(signingKey) : undefined,
    generateSigningAccount: () =>
      !isUndefined(account) ? generateSigningAccount(account, signTypedData, setSigningKey) : undefined,
  };
};

const generateSigningAccount = async (
  account: `0x${string}`,
  signTypedData: WalletProviderHook["signTypedData"],
  setSigningKey: (signingKey: `0x${string}`) => void
) => {
  console.log("generateSigningAccount", { account });
  if (isUndefined(account)) return;
  const signature = await signTypedData(messages.signingAccount(account));
  const signingKey = keccak256(signature);
  setSigningKey(signingKey);
  return privateKeyToAccount(signingKey);
};

export default useSigningAccount;
