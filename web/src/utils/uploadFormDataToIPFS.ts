import { toast } from "react-toastify";

import { OPTIONS } from "utils/wrapWithToast";

export function uploadFormDataToIPFS(formData: FormData, operation = "evidence"): Promise<Response> {
  const authToken = sessionStorage.getItem("authToken")?.replace(/"/g, "");

  return toast.promise<Response, Error>(
    fetch(`/.netlify/functions/uploadToIPFS?key=kleros-v2&operation=${operation}`, {
      method: "POST",
      headers: {
        "x-auth-token": authToken ?? "",
      },
      body: formData,
    }).then(async (response) => {
      if (response.status !== 200) {
        const error = await response.json().catch(() => ({ message: "Error uploading to IPFS" }));
        throw new Error(error.message);
      }
      return response;
    }),
    {
      pending: `Uploading ${operation} to IPFS...`,
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
