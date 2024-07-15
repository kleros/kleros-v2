import { toast, ToastPosition, Theme } from "react-toastify";
import { PublicClient, TransactionReceipt } from "viem";

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

type WrapWithToastReturnType = {
  status: boolean;
  result?: TransactionReceipt;
};

export async function wrapWithToast(
  contractWrite: () => Promise<`0x${string}`>,
  publicClient: PublicClient
): Promise<WrapWithToastReturnType> {
  toast.info("Transaction initiated", OPTIONS);
  return await contractWrite()
    .then(
      async (hash) =>
        await publicClient.waitForTransactionReceipt({ hash, confirmations: 2 }).then((res: TransactionReceipt) => {
          const status = res.status === "success";

          if (status) toast.success("Transaction mined!", OPTIONS);
          else toast.error("Transaction reverted!", OPTIONS);

          return { status, result: res };
        })
    )
    .catch((error) => {
      toast.error(error.shortMessage ?? error.message, OPTIONS);
      return { status: false };
    });
}

export async function catchShortMessage(promise: Promise<any>) {
  return await promise.catch((error) => toast.error(error.shortMessage ?? error.message, OPTIONS));
}
