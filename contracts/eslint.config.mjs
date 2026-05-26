import shared from "@kleros/kleros-v2-eslint-config/flat.config.mjs";
import chaiFriendly from "eslint-plugin-chai-friendly";

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
      //Unused var errors in console-init scripts, so instead of ignoring them per file, ignore them here.
      //The "unused" exports are interactive helpers, not dead code.
      "scripts/**/console*.ts",
    ],
  },
  ...shared,
  {
    //Chai friend rules so things like expect(something).to.be.true are not flagged as unused expressions
    files: ["test/**/*.ts"],
    plugins: {
      "chai-friendly": chaiFriendly,
    },
    rules: {
      "@typescript-eslint/no-unused-expressions": "off",
      "chai-friendly/no-unused-expressions": "error",
    },
  },
];
