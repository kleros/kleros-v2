import useSWR from "swr";
import { useWeb3 } from "hooks/useWeb3";

export function useETHBalance() {
  const { library, account } = useWeb3();
  return useSWR(
    () => (library && account ? `ETHBalance{account}` : false),
    async () => {
      if (library && account) {
        const balance = await library.getBalance(account);
        return balance;
      } else {
        return undefined;
      }
    }
  );
}
