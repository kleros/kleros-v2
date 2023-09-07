import { toast } from "react-toastify";
import { OPTIONS } from "utils/wrapWithToast";

export function uploadSettingsToSupabase(formData: any): Promise<Response> {
  console.log("formdata", formData);
  console.log("stringified formdata", JSON.stringify(formData));
  return toast.promise<Response, Error>(
    fetch("/.netlify/functions/update-settings", {
      method: "POST",
      body: JSON.stringify(formData),
    }).then(async (response) => {
      if (response.status !== 200) {
        const error = await response.json().catch(() => ({ message: "Error uploading to Supabase" }));
        throw new Error(error.message);
      }
      return response;
    }),
    {
      pending: "Uploading settings to Supabase...",
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
