import { toast, ToastContentProps } from "react-toastify";
import { OPTIONS } from "utils/wrapWithToast";
import { FetchError } from "node-fetch";

interface renderError extends ToastContentProps {
  data: FetchError;
}

export function uploadFormDataToIPFS(formData: FormData) {
  return toast.promise(
    fetch("/.netlify/functions/uploadToIPFS", {
      method: "POST",
      body: formData,
    }),
    {
      pending: "Uploading evidence to IPFS...",
      success: "Uploaded to IPFS!",
      error: {
        render({ data }: renderError) {
          return `Upload failed ${data.message}`;
        },
      },
    },
    OPTIONS
  );
}
