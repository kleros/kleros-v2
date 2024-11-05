import { GraphQLError } from "graphql";
import { gql, type GraphQLClient } from "graphql-request";
import { toast } from "react-toastify";

import { OPTIONS } from "utils/wrapWithToast";

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

export function addUser(client: GraphQLClient, userData: AddUserData): Promise<boolean> {
  const variables = {
    settings: userData,
  };

  return toast.promise<boolean, Error>(
    client
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
      }),
    {
      pending: `Adding User ...`,
      success: "User added successfully!",
      error: {
        render({ data: error }) {
          return `Adding User failed: ${error?.message}`;
        },
      },
    },
    OPTIONS
  );
}
