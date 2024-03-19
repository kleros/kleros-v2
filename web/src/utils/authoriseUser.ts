import { toast } from "react-toastify";
import { OPTIONS } from "utils/wrapWithToast";

type authoriseUserData = {
  address: `0x${string}`;
  signature: `0x${string}`;
  message: string;
};

export function authoriseUser(authData: authoriseUserData): Promise<Response> {
  return toast.promise<Response, Error>(
    fetch(`/.netlify/functions/authUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(authData),
    }).then(async (response) => {
      if (response.status !== 200) {
        const error = await response.json().catch(() => ({ message: "Error signing in" }));
        throw new Error(error.message);
      }
      return response;
    }),
    {
      pending: `Signing in User...`,
      success: "Signed In successfully!",
      error: {
        render({ data: error }) {
          return `Sign-In failed: ${error?.message}`;
        },
      },
    },
    OPTIONS
  );
}
