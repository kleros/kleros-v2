import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: ["https://api.thegraph.com/subgraphs/name/kleros/kleros-v2-core-arbitrum-goerli"],
  documents: "./src/hooks/queries/*.ts",
  generates: {
    "./src/graphql/": {
      preset: "client",
    },
  },
};

export default config;
