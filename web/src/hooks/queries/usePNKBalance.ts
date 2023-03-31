import useSWR from "swr";
import { useProvider } from "wagmi";
import { usePnk } from "hooks/contracts/generated";

export const usePNKBalance = (user?: `0x${string}` | null) => {
  const provider = useProvider();
  const pnkContract = usePnk({ signerOrProvider: provider });
  return useSWR(
    () => (pnkContract && user ? `PNKBalance${user}` : false),
    async () => {
      if (pnkContract && user) {
        const balance = await pnkContract.balanceOf(user);
        return balance;
      } else {
        return undefined;
      }
    }
  );
};
