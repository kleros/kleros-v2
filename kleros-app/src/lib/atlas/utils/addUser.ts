import { GraphQLError } from "graphql";
import { gql, type GraphQLClient } from "graphql-request";

const query = gql`
  mutation AddUser($settings: AddUserSettingsDto!) {
    addUser(addUserSettings: $settings)
  }
`;

export type AddUserData = {
  email: string;
};

type AddUserResponse = {
  addUser: boolean;
};

export async function addUser(client: GraphQLClient, userData: AddUserData): Promise<boolean> {
  const variables = {
    settings: userData,
  };

  return client
    .request<AddUserResponse>(query, variables)
    .then(async (response) => response.addUser)
    .catch((errors) => {
      // eslint-disable-next-line no-console
      console.log("Add User error:", { errors });

      const error = errors?.response?.errors?.[0];

      if (error) {
        throw new GraphQLError(error?.message, { ...error });
      }
      throw new Error("Unknown Error");
    });
}
