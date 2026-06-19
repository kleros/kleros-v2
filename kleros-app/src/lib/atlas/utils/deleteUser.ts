import { GraphQLError } from "graphql";
import { gql, type GraphQLClient } from "graphql-request";

const query = gql`
  mutation DeleteUser {
    deleteUser
  }
`;

type DeleteUserResponse = {
  deleteUser: boolean;
};

export async function deleteUser(client: GraphQLClient): Promise<boolean> {
  return client
    .request<DeleteUserResponse>(query, {})
    .then(async (response) => response.deleteUser)
    .catch((errors) => {
      // eslint-disable-next-line no-console
      console.log("Delete User error", { errors });

      const error = errors?.response?.errors?.[0];

      if (error) {
        throw new GraphQLError(error?.message, { ...error });
      }
      throw new Error("Unknown Error");
    });
}
