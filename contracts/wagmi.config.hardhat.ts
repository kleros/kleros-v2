import { defineConfig } from "@wagmi/cli";
import { hardhat } from "@wagmi/cli/plugins";

// Useful for contracts which are not deployed yet
export default defineConfig({
  out: "deployments/hardhat.viem.ts",
  plugins: [
    hardhat({
      project: ".",
      namePrefix: "Hardhat",
      exclude: ["Initializable.json", "UpgradedByRewrite.json"], // These artifacts crash the wagmi cli name generator
    }),
  ],
});
