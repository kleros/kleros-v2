import { useSignTypedData } from "@privy-io/react-auth";
import { useLocalStorage } from "react-use";
import { Hex, keccak256 } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { useWalletClient } from "wagmi";

import messages from "consts/eip712-messages";
import { useEmbeddedWallet } from "hooks/useIsEmbeddedWallet";
import { isUndefined } from "utils/index";

/** `account` only selects the signer; it is not part of the EIP-712 payload, so Privy gets everything else. */
export const toPrivyTypedData = (typedData: ReturnType<typeof messages.signingAccount>) => {
  const { account: _, ...message } = typedData;
  return message;
};

const useSigningAccount = () => {
  const { data: wallet } = useWalletClient();
  const embeddedWallet = useEmbeddedWallet();
  const { signTypedData: privySignTypedData } = useSignTypedData();
  const address = wallet?.account.address;
  const key = `signingAccount-${address}`;
  const [signingKey, setSigningKey] = useLocalStorage<Hex>(key);

  const sign = async (): Promise<Hex | undefined> => {
    if (isUndefined(address) || isUndefined(wallet)) return;
    const typedData = messages.signingAccount(address);
    if (embeddedWallet) {
      // Privy signs silently for the embedded wallet; wagmi would open a Privy modal.
      const { signature } = await privySignTypedData(toPrivyTypedData(typedData), {
        uiOptions: { showWalletUIs: false },
        address: embeddedWallet.address,
      });
      return signature as Hex;
    }
    return wallet.signTypedData(typedData);
  };

  const generateSigningAccount = async () => {
    const signature = await sign();
    if (isUndefined(signature)) return;
    const newSigningKey = keccak256(signature);
    setSigningKey(newSigningKey);
    return privateKeyToAccount(newSigningKey);
  };

  return {
    signingAccount: !isUndefined(signingKey) ? privateKeyToAccount(signingKey) : undefined,
    generateSigningAccount,
  };
};

export default useSigningAccount;
