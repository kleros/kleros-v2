import { gql, type GraphQLClient } from "graphql-request";
import { toast } from "react-toastify";

import { OPTIONS } from "utils/wrapWithToast";

export async function uploadToIpfs(client: GraphQLClient, file: File): Promise<string | null> {
  const presignedUrl = await getPreSignedUrl(client, file.name);

  return toast.promise<string | null, Error>(
    fetch(presignedUrl, {
      method: "PUT",
      body: file,
    }).then(async (response) => {
      if (response.status !== 200) {
        const error = await response.json().catch(() => ({ message: "Error uploading to IPFS" }));
        throw new Error(error.message);
      }
      return response.headers.get("x-amz-meta-cid");
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

const presignedUrlQuery = gql`
  mutation GetPresignedUrl($filename: String!) {
    getPresignedUrl(filename: $filename, appname: KlerosCourt)
  }
`;

type GetPresignedUrlResponse = {
  getPresignedUrl: string;
};

const getPreSignedUrl = (client: GraphQLClient, filename: string) => {
  const variables = {
    filename,
  };

  return toast.promise<string, Error>(
    client
      .request<GetPresignedUrlResponse>(presignedUrlQuery, variables)
      .then(async (response) => response.getPresignedUrl)
      .catch((errors) => {
        // eslint-disable-next-line no-console
        console.log("Get Presigned Url error:", { errors });

        const errorMessage = Array.isArray(errors?.response?.errors)
          ? errors.response.errors[0]?.message
          : "Unknown error";
        throw new Error(errorMessage);
      }),
    {
      error: {
        render({ data: error }) {
          return `Getting Presigned Url failed: ${error?.message}`;
        },
      },
    },
    OPTIONS
  );
};
