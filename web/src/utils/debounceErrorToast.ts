import { toast } from "react-toastify";
import { OPTIONS as toastOptions } from "utils/wrapWithToast";

let timeoutId: NodeJS.Timeout;
export const debounceErrorToast = (msg: string) => {
  if (timeoutId) clearTimeout(timeoutId);

  timeoutId = setTimeout(() => {
    toast.error(msg, toastOptions);
  }, 5000);
};
