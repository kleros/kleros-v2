import { useLocalStorage } from "react-use";
import { Hex, WalletClient, keccak256 } from "viem";
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
    signingAccount: !isUndefined(signingKey) ? privateKeyToAccount(signingKey) : undefined,
    generateSigningAccount: () => (!isUndefined(wallet) ? generateSigningAccount(wallet, setSigningKey) : undefined),
  };
};

const generateSigningAccount = async (wallet: WalletClient, setSigningKey: (signingKey: `0x${string}`) => void) => {
  if (isUndefined(wallet.account)) return;
  const signature = await wallet.signTypedData(messages.signingAccount(wallet.account.address));
  const signingKey = keccak256(signature);
  setSigningKey(signingKey);
  return privateKeyToAccount(signingKey);
};

export default useSigningAccount;
