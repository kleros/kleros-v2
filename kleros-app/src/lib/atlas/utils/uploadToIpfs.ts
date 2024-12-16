import { Products, Roles } from ".";

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

  return fetch(`${config.baseUrl}/ipfs/file`, {
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
  });
}

export class AuthorizationError extends Error {
  readonly name = "AuthorizationError" as const;
  constructor(message: string) {
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
