import { gql, type GraphQLClient } from "graphql-request";
import { Products } from ".";

export type Role = {
  name: string;
  restriction: {
    maxSize: number;
    allowedMimeTypes: string[];
  };
};

type FetchRolesResponse = {
  roles: Role[];
};

const query = gql`
  query Roles($product: Products!) {
    roles(product: $product) {
      name
      restriction {
        maxSize
        allowedMimeTypes
      }
    }
  }
`;

export async function fetchRestrictions(client: GraphQLClient, product: Products): Promise<Role[]> {
  return client
    .request<FetchRolesResponse>(query, { product })
    .then((response) => response.roles)
    .catch((errors) => {
      // eslint-disable-next-line no-console
      console.log("Error fetching roles :", { errors });
      const errorMessage = Array.isArray(errors?.response?.errors)
        ? errors.response.errors[0]?.message
        : "Error fetching roles";
      throw Error(errorMessage);
    });
}
