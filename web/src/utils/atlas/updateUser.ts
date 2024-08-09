import { gql, type GraphQLClient } from "graphql-request";
import { toast } from "react-toastify";

import { OPTIONS } from "utils/wrapWithToast";

const query = gql`
  mutation UpdateUser($settings: UpdateUserDto!) {
    updateUser(updateUserSettings: $settings)
  }
`;

export type UpdateUserData = {
  email?: string;
  notifications_courtV2?: boolean;
};

type UpdateUserResponse = {
  updateUser: boolean;
};

export function updateUser(client: GraphQLClient, userData: UpdateUserData): Promise<boolean> {
  const variables = { settings: userData };

  return toast.promise<boolean, Error>(
    client
      .request<UpdateUserResponse>(query, variables)
      .then(async (response) => response.updateUser)
      .catch((errors) => {
        // eslint-disable-next-line no-console
        console.log("Update User error:", { errors });

        const errorMessage = Array.isArray(errors?.response?.errors)
          ? errors.response.errors[0]?.message
          : "Unknown error";
        throw new Error(errorMessage);
      }),
    {
      pending: `Updating Settings ...`,
      success: "Settings Updated successfully!",
      error: {
        render({ data: error }) {
          return `Updating Settings failed: ${error?.message}`;
        },
      },
    },
    OPTIONS
  );
}
