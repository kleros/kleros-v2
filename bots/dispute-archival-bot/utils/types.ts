type GraphQLError = {
  message: string;
  path?: (string | number)[];
};

export type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLError[];
};
