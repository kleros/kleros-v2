import { toast } from "react-toastify";

import { OPTIONS } from "utils/wrapWithToast";

type SettingsToSupabaseData = {
  email: string;
  telegram: string;
  address: `0x${string}`;
};

export function uploadSettingsToSupabase(formData: SettingsToSupabaseData): Promise<Response> {
  // storing token in storage adds double quotes to it, so when its passed as header it becomes `"token"`, so we remove double quotes
  const authToken = sessionStorage.getItem("auth-token")?.replace(/"/g, "");

  return toast.promise<Response, Error>(
    fetch("/.netlify/functions/update-settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": authToken ?? "",
      },
      body: JSON.stringify(formData),
    }).then(async (response) => {
      if (response.status !== 200) {
        const error = await response.json().catch(() => ({ message: "Error uploading to Supabase" }));
        throw new Error(error.message);
      }
      return response;
    }),
    {
      pending: "Saving...",
      success: "Saved successfully!",
      error: {
        render({ data: error }) {
          return `Upload failed: ${error?.message}`;
        },
      },
    },
    OPTIONS
  );
}
