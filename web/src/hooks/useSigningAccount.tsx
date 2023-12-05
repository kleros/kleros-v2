import { useLocalStorage } from "react-use";
import { Hex, WalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { useWalletClient } from "wagmi";
import messages from "consts/eip712-messages";
import { isUndefined } from "utils/index";

const useSigningAccount = () => {
  const { data: wallet } = useWalletClient();
  const address = wallet?.account.address;
  const key = `signingAccount-${address}`;
  const [signingKey, setSigningKey] = useLocalStorage<Hex>(key);
  return {
    signingAccount: !isUndefined(signingKey) ? privateKeyToAccount(signingKey) : null,
    generateSigningAccount: () => (!isUndefined(wallet) ? generateSigningAccount(wallet, setSigningKey) : null),
  };
};

const generateSigningAccount = async (wallet: WalletClient, setSigningKey: (signingKey: `0x${string}`) => void) => {
  if (isUndefined(wallet.account)) return;
  const signingKey = await wallet.signTypedData(messages.signingAccount(wallet.account.address));
  setSigningKey(signingKey);
  return privateKeyToAccount(signingKey);
};

export default useSigningAccount;
