import { toast } from "react-toastify";
import { OPTIONS } from "utils/wrapWithToast";

export function uploadFormDataToIPFS(formData: FormData): Promise<Response> {
  return toast.promise<Response, Error>(
    fetch("/.netlify/functions/uploadToIPFS?dapp=court&key=kleros-v2&operation=evidence", {
      method: "POST",
      body: formData,
    }).then(async (response) => {
      if (response.status !== 200) {
        const error = await response.json().catch(() => ({ message: "Error uploading to IPFS" }));
        throw new Error(error.message);
      }
      return response;
    }),
    {
      pending: "Uploading evidence to IPFS...",
      success: "Uploaded successfully!",
      error: {
        render({ data: error }) {
          return `Upload failed: ${error?.message}`;
        },
      },
    },
    OPTIONS
  );
}
