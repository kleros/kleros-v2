import { gql, type GraphQLClient } from "graphql-request";

export type User = {
  email: string;
  isEmailVerified: boolean;
  emailUpdateableAt: string | null;
};

type GetUserResponse = {
  user: User;
};
const query = gql`
  query GetUser {
    user {
      email
      isEmailVerified
      emailUpdateableAt
    }
  }
`;

export async function fetchUser(client: GraphQLClient): Promise<User> {
  return client
    .request<GetUserResponse>(query)
    .then((response) => response.user)
    .catch((errors) => {
      // eslint-disable-next-line no-console
      console.log("Error fetching user :", { errors });
      const errorMessage = Array.isArray(errors?.response?.errors)
        ? errors.response.errors[0]?.message
        : "Error fetching user";
      throw Error(errorMessage);
    });
}
