import { gql, type GraphQLClient } from "graphql-request";
import { toast } from "react-toastify";

import { OPTIONS } from "utils/wrapWithToast";

type GetNonce = {
  nonce: string;
};

const query = gql`
  mutation GetNonce($address: Address!) {
    nonce(address: $address)
  }
`;

export function getNonce(client: GraphQLClient, address: string): Promise<string> {
  const variables = {
    address,
  };

  return toast.promise<string, Error>(
    client
      .request<GetNonce>(query, variables)
      .then((response) => response.nonce)
      .catch((errors) => {
        // eslint-disable-next-line no-console
        console.log("Error fetching nonce for address:", address, { errors });
        const errorMessage = Array.isArray(errors?.response?.errors)
          ? errors.response.errors[0]?.message
          : "Error fetching nonce";
        throw Error(errorMessage);
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
