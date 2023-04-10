import { toast, ToastContentProps } from "react-toastify";
import { OPTIONS } from "utils/wrapWithToast";
import { FetchError } from "node-fetch";

interface RenderError extends ToastContentProps {
  data: FetchError;
}

export function uploadFormDataToIPFS(formData: FormData): Promise<Response> {
  return toast.promise(
    new Promise((resolve, reject) =>
      fetch("/.netlify/functions/uploadToIPFS", {
        method: "POST",
        body: formData,
      }).then(async (response) =>
        response.status === 200
          ? resolve(response)
          : reject({ message: (await response.json()).message })
      )
    ),
    {
      pending: "Uploading evidence to IPFS...",
      success: "Uploaded successfully!",
      error: {
        render({ data }: RenderError) {
          return `Upload failed: ${data.message}`;
        },
      },
    },
    OPTIONS
  );
}
