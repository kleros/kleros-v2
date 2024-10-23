import { gql, type GraphQLClient } from "graphql-request";
import { toast } from "react-toastify";

import { OPTIONS } from "utils/wrapWithToast";

type GetUserResponse = {
  user: {
    email: string;
    isEmailVerified: string;
  };
};

export type User = {
  email: string;
  isEmailVerified: string;
};

const query = gql`
  query GetUser {
    user {
      email
      isEmailVerified
    }
  }
`;

export function fetchUser(client: GraphQLClient): Promise<User> {
  return toast.promise<User, Error>(
    client
      .request<GetUserResponse>(query)
      .then((response) => response.user)
      .catch((errors) => {
        // eslint-disable-next-line no-console
        console.log("Error fetching user :", { errors });
        const errorMessage = Array.isArray(errors?.response?.errors)
          ? errors.response.errors[0]?.message
          : "Error fetching user";
        throw Error(errorMessage);
      }),
    {
      error: {
        render({ data: error }) {
          return `${error?.message}`;
        },
      },
    },
    OPTIONS
  );
}
