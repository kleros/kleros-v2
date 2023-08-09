import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    "https://api.thegraph.com/subgraphs/name/alcercu/kleroscoretest",
    "https://api.thegraph.com/subgraphs/name/alcercu/disputetemplateregistryarbgrli",
  ],
  documents: "./src/hooks/queries/*.ts",
  generates: {
    "./src/graphql/": {
      preset: "client",
    },
  },
};

export default config;
