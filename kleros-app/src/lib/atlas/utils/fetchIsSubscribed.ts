import { gql, type GraphQLClient } from "graphql-request";
import { Address } from "viem";

type IsSubscribedResponse = {
  isSubscribed: boolean;
};

const query = gql`
  query isSubscribed($address: Address!) {
    isSubscribed(address: $address)
  }
`;

export async function fetchIsSubscribed(client: GraphQLClient, address: Address): Promise<boolean> {
  return client
    .request<IsSubscribedResponse>(query, { address })
    .then((response) => response.isSubscribed)
    .catch((errors) => {
      // eslint-disable-next-line no-console
      console.log("Error fetching subscription status :", { errors });
      const errorMessage = Array.isArray(errors?.response?.errors)
        ? errors.response.errors[0]?.message
        : "Error fetching subscription status.";
      throw Error(errorMessage);
    });
}
