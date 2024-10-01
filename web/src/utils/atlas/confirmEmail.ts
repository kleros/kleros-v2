import { gql, type GraphQLClient } from "graphql-request";

const query = gql`
  mutation ConfirmEmail($address: String!, $token: String!) {
    confirmEmail(address: $address, token: $token)
  }
`;

export type ConfirmEmailData = {
  address: string;
  token: string;
};

type ConfirmEmailResponse = {
  confirmEmail: boolean;
};

export async function confirmEmail(client: GraphQLClient, userData: ConfirmEmailData) {
  const variables = userData;

  return client
    .request<ConfirmEmailResponse>(query, variables)
    .then(async (response) => response.confirmEmail)
    .catch((errors) => {
      // eslint-disable-next-line no-console
      console.log("Confirm Email error:", { errors });

      throw new Error("Unable to verify.");
    });
}
