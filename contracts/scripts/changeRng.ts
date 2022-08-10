import { deployments, getNamedAccounts, getChainId, ethers } from "hardhat";
const { deploy, execute } = deployments;

enum HomeChains {
  ARBITRUM_ONE = 42161,
  ARBITRUM_RINKEBY = 421611,
  ARBITRUM_GOERLI = 421613,
  HARDHAT = 31337,
}

async function main() {
  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await ethers.getSigners())[0].address;

  const chainId = Number(await getChainId());
  if (!HomeChains[chainId]) {
    console.error(`Aborting: script is not compatible with ${chainId}`);
    return;
  } else {
    console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);
  }

  const rng = await deploy("IncrementalNG", {
    from: deployer,
    args: [ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Hello World!"))],
    log: true,
    skipIfAlreadyDeployed: false, // BUG: this parameter does nothing
  });

  const disputeKitDeployment = await deployments.get("DisputeKitClassic");
  const disputeKit = await ethers.getContractAt("DisputeKitClassic", disputeKitDeployment.address);
  const currentRng = await disputeKit.rng();
  if (currentRng !== rng.address) {
    console.log(`New RNG deployed at ${rng.address}. Updating dispute kit...`);
    await execute("DisputeKitClassic", { from: deployer, log: true }, "changeRandomNumberGenerator", rng.address);
  } else {
    console.log(`Same RNG as before, nothing to do.`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
