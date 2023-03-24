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

export async function wrapWithToast(tx: Promise<any>) {
  toast.info("Transaction initiated", OPTIONS);
  await tx
    .then((tx) => {
      tx.wait(2);
      toast.success("Transaction mined!", OPTIONS);
    })
    .catch((error) => {
      toast.error(error.message, OPTIONS);
    });
}
