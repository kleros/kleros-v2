import { GraphQLError } from "graphql";
import { gql, type GraphQLClient } from "graphql-request";
import { SignupProduct } from ".";

const query = gql`
  mutation UpdateEmail($newEmail: String!, $product: SignupProduct!) {
    updateEmail(newEmail: $newEmail, product: $product)
  }
`;

export type UpdateEmailData = {
  newEmail: string;
  product: SignupProduct;
};

type UpdateEmailResponse = {
  updateEmail: boolean;
};

export async function updateEmail(client: GraphQLClient, userData: UpdateEmailData): Promise<boolean> {
  const variables = userData;

  return client
    .request<UpdateEmailResponse>(query, variables)
    .then(async (response) => response.updateEmail)
    .catch((errors) => {
      // eslint-disable-next-line no-console
      console.log("Update Email error:", { errors });

      const error = errors?.response?.errors?.[0];

      if (error) {
        throw new GraphQLError(error?.message, { ...error });
      }
      throw new Error("Unknown Error");
    });
}
