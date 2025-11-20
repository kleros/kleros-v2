import { task } from "hardhat/config";
import "hardhat-deploy";

task("verify-all", "Verify all deployed contracts using Hardhat-Deploy deployments")
  .addOptionalParam("contract", "Verify only a specific contract name")
  .setAction(async ({ contract }, hre) => {
    const { deployments, run, network } = hre;

    console.log(`\n🔍 Network: ${network.name}`);

    const allDeployments = await deployments.all();
    const entries = Object.entries(allDeployments);

    for (const [name, deployment] of entries) {
      if (contract && name !== contract) continue;

      // skip proxy files (we only skip by naming convention)
      if (name.endsWith("_Proxy")) {
        console.log(`Skipping proxy: ${name}`);
        continue;
      }

      const address = deployment.address;
      const args = deployment.args || [];

      try {
        await run("verify:verify", {
          address,
          constructorArguments: args,
        });
      } catch (err: any) {
        const msg = err.message || err.toString();

        if (msg.includes("Already Verified")) {
          console.log(`   ✔ Already verified\n`);
          continue;
        }

        console.log(`   ❌ Verification failed: ${msg}\n`);
      }
    }
  });
