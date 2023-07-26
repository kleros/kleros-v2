import { defineConfig } from "@wagmi/cli";
import { hardhat } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "viem/generated.hardhat.ts",
  contracts: [],
  plugins: [
    hardhat({
      project: ".",
    }),
  ],
});
