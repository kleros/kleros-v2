import { toast, ToastPosition, Theme } from "react-toastify";

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
  return await contractWrite()
    .then(
      async (hash) =>
        await publicClient.waitForTransactionReceipt({ hash, confirmations: 2 }).then(() => {
          toast.success("Transaction mined!", OPTIONS);
          return true;
        })
    )
    .catch((error) => {
      toast.error(error.shortMessage ?? error.message, OPTIONS);
      return false;
    });
}

export async function catchShortMessage(promise: Promise<any>) {
  return await promise.catch((error) => toast.error(error.shortMessage ?? error.message, OPTIONS));
}
