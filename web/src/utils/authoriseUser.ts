import { toast } from "react-toastify";

import { OPTIONS } from "utils/wrapWithToast";

type AuthoriseUserData = {
  address: `0x${string}`;
  signature: `0x${string}`;
  message: string;
};
const atlasUri = import.meta.env.REACT_APP_ATLAS_URI ?? "";

export function authoriseUser(authData: AuthoriseUserData): Promise<string> {
  const query = `mutation Login($message: String!, $signature: String!) {
    login(message: $message, signature: $signature)
  }
  `;
  const variables = {
    message: authData.message,
    signature: authData.signature,
  };

  return toast.promise<string, Error>(
    fetch(atlasUri, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Error signing in" }));
        throw new Error(error.message);
      }

      const result = await response.json();

      const token = result.data.login.accessToken;

      // TODO ugly fix until a more standard return type in decided upon in atlas
      if (token) {
        return token;
      } else {
        throw new Error(result.data);
      }
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
    fetch(atlasUri, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Error getting nonce" }));
        throw new Error(error.message);
      }
      const result = await response.json();

      const nonce = result.data.nonce;

      // TODO ugly fix until a more standard return type in decided upon in atlas
      if (nonce) {
        return nonce;
      } else {
        throw new Error(result.data);
      }
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
