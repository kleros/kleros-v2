import type { CodegenConfig } from "@graphql-codegen/cli";

import { getGraphqlUrl } from "utils/getGraphqlUrl";

const config: CodegenConfig = {
  overwrite: true,
  schema: [getGraphqlUrl(false), getGraphqlUrl(true)],
  documents: "./src/hooks/queries/*.ts",
  generates: {
    "./src/graphql/": {
      preset: "client",
      config: {
        scalars: {
          BigInt: "string",
          Bytes: "string",
        },
      },
    },
  },
};

export default config;
