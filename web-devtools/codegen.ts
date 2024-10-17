import type { CodegenConfig } from "@graphql-codegen/cli";

import { getGraphqlUrl } from "./src/utils/getGraphqlUrl";

const config: CodegenConfig = {
  overwrite: true,
  schema: [getGraphqlUrl(false), getGraphqlUrl(true)],
  documents: "./src/hooks/queries/*.ts",
  generates: {
    "./src/graphql-generated/": {
      preset: "client",
    },
  },
};

export default config;
