import { toast } from "react-toastify";

import { OPTIONS } from "utils/wrapWithToast";

export enum Products {
  CourtV2 = "CourtV2",
}

export enum Roles {
  Photo = "photo",
  Evidence = "evidence",
  Policy = "policy",
  Generic = "generic",
}

export type IpfsUploadPayload = {
  file: File;
  name: string;
  product: Products;
  role: Roles;
};

type Config = {
  baseUrl: string;
  authToken: string;
};

export async function uploadToIpfs(config: Config, payload: IpfsUploadPayload): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", payload.file, payload.name);
  formData.append("name", payload.name);
  formData.append("product", payload.product);
  formData.append("role", payload.role);

  return toast.promise<string | null, Error>(
    fetch(`${config.baseUrl}/ipfs/file`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${config.authToken}`,
      },
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Error uploading to IPFS" }));

        if (response.status === 401) throw new AuthorizationError(error.message);

        throw new Error(error.message);
      }

      return await response.text();
    }),
    {
      pending: `Uploading to IPFS...`,
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

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
