import { toast, ToastPosition, Theme } from "react-toastify";
import { TransactionReceipt } from "viem";

export const OPTIONS = {
  position: "top-center" as ToastPosition,
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored" as Theme,
};

export async function wrapWithToast(contractWrite: () => Promise<`0x${string}`>, publicClient: any) {
  toast.info("Transaction initiated", OPTIONS);
  const hash = await contractWrite();
  return await publicClient
    .waitForTransactionReceipt({ hash, confirmations: 2 })
    .then((response: TransactionReceipt) => {
      toast.success("Transaction mined!", OPTIONS);
      return response;
    })
    .catch((error) => {
      toast.error(error.message, OPTIONS);
    });
}
