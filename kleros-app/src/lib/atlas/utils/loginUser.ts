import { gql, type GraphQLClient } from "graphql-request";

const query = gql`
  mutation Login($message: String!, $signature: String!) {
    login(message: $message, signature: $signature)
  }
`;

type AuthoriseUserData = {
  signature: `0x${string}`;
  message: string;
};

type Login = {
  login: {
    accessToken: string;
  };
};

export async function loginUser(client: GraphQLClient, authData: AuthoriseUserData): Promise<string> {
  const variables = {
    message: authData.message,
    signature: authData.signature,
  };

  return client
    .request<Login>(query, variables)
    .then(async (response) => response.login.accessToken)
    .catch((errors) => {
      // eslint-disable-next-line no-console
      console.log("Authorization error:", { errors });

      const errorMessage = Array.isArray(errors?.response?.errors)
        ? errors.response.errors[0]?.message
        : "Unknown error";
      throw new Error(errorMessage);
    });
}
