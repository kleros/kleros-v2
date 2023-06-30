import { toast, ToastContentProps } from "react-toastify";
import { OPTIONS } from "utils/wrapWithToast";

export function uploadFormDataToIPFS(formData: FormData): Promise<Response> {
  return toast.promise(
    new Promise((resolve, reject) =>
      fetch("/.netlify/functions/uploadToIPFS?dapp=court&key=kleros-v2&operation=evidence", {
        method: "POST",
        body: formData,
      }).then(async (response) =>
        response.status === 200
          ? resolve(response)
          : reject(await response.json().catch(() => ({ message: "Error uploading to IPFS" })))
      )
    ),
    {
      pending: "Uploading evidence to IPFS...",
      success: "Uploaded successfully!",
      error: {
        render({ data }: ToastContentProps<{ message: string }>) {
          return `Upload failed: ${data?.message}`;
        },
      },
    },
    OPTIONS
  );
}
