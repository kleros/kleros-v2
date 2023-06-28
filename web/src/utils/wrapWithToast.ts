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
  console.log("1 before contractwrite");
  const { hash } = await contractWrite();
  console.log("2 after contractwrite, hash:", hash);
  await publicClient
    .waitForTransactionReceipt({ hash, confirmations: 2 })
    .then(() => {
      console.log("3 inside waitfortransactionreceipt");
      toast.success("Transaction mined!", OPTIONS);
    })
    .catch((error) => {
      console.log("4 inside waitfortransaction catch", error);
      toast.error(error.message, OPTIONS);
    });
}
