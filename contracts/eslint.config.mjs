import shared from "@kleros/kleros-v2-eslint-config/flat.config.mjs";

export default [
  {
    //Only lint hand-written code, ignore generated files and build outputs.
    ignores: [
      "**/node_modules/**",
      "**/artifacts/**",
      "**/cache*/**",
      "**/coverage/**",
      "**/typechain-types/**",
      "**/lib/**",
      "**/dist/**",
      "deployments/arbitrum*.ts",
      "deployments/*.viem.ts",
      "deployments/*/**",
    ],
  },
  ...shared,
];
