import type { CodegenConfig } from "@graphql-codegen/cli";

import { getGraphqlUrl } from "./src/actions/getGraphqlUrl";

const config: CodegenConfig = {
  overwrite: true,
  schema: [getGraphqlUrl(false), getGraphqlUrl(true)],
  documents: "./src/hooks/queries/*.ts",
  generates: {
    "./src/graphql/": {
      preset: "client",
    },
  },
};

export default config;
