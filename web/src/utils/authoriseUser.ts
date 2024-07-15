import { toast } from "react-toastify";

import { OPTIONS } from "utils/wrapWithToast";

type AuthoriseUserData = {
  address: `0x${string}`;
  signature: `0x${string}`;
  message: string;
};

export function authoriseUser(authData: AuthoriseUserData): Promise<string> {
  const query = `mutation Login {
    login(message: "${authData.message}", signature: "${authData.signature}")
  }
  `;

  return toast.promise<string, Error>(
    fetch(`/.netlify/functions/authUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }).then(async (response) => {
      if (response.status !== 200) {
        const error = await response.json().catch(() => ({ message: "Error signing in" }));
        throw new Error(error.message);
      }
      return (await response.json()).data.login.access_token;
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

export function getNonce(address: string): Promise<string> {
  const query = `mutation GetNonce {
    nonce(address: "${address}")
}`;

  return toast.promise<string, Error>(
    fetch(`/.netlify/functions/getNonce?address=${address}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }).then(async (response) => {
      if (response.status !== 200) {
        const error = await response.json().catch(() => ({ message: "Error getting nonce" }));
        throw new Error(error.message);
      }
      return (await response.json()).data.nonce;
    }),
    {
      error: {
        render({ data: error }) {
          return `${error?.message}`;
        },
      },
    },
    OPTIONS
  );
}
