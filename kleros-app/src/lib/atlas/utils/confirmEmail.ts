import { gql, type GraphQLClient } from "graphql-request";

const query = gql`
  mutation ConfirmEmail($address: Address!, $token: String!) {
    confirmEmail(confirmEmailInput: { address: $address, token: $token }) {
      isConfirmed
      isTokenExpired
      isTokenInvalid
    }
  }
`;

export type ConfirmEmailData = {
  address: string;
  token: string;
};

export type ConfirmEmailResponse = {
  isConfirmed: boolean;
  isTokenExpired: boolean;
  isTokenInvalid: boolean;
};

export async function confirmEmail(client: GraphQLClient, userData: ConfirmEmailData) {
  const variables = userData;

  return client
    .request<{ confirmEmail: ConfirmEmailResponse }>(query, variables)
    .then(async (response) => response.confirmEmail)
    .catch((errors) => {
      // eslint-disable-next-line no-console
      console.log("Confirm Email error:", { errors });

      throw new Error("Unable to verify.");
    });
}
