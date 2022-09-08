import { deployments, getNamedAccounts, getChainId, ethers } from "hardhat";
import { KlerosCore } from "../typechain-types";
import courtsV1 from "../courts.v1.json";
import { BigNumber } from "ethers";

enum HomeChains {
  ARBITRUM_ONE = 42161,
  ARBITRUM_RINKEBY = 421611,
  ARBITRUM_GOERLI = 421613,
  HARDHAT = 31337,
}

const GENERAL_COURT = BigNumber.from(1);
const DISPUTE_KIT_CLASSIC = BigNumber.from(1);

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

  // WARNING: skip the Forking court at id 0, so the v1 courts are shifted by 1
  const courtsV2 = courtsV1.map((court) => ({
    ...court,
    id: BigNumber.from(court.id).add(1),
    parent: BigNumber.from(court.parent).add(1),
  }));

  console.log("courtsV2 = %O", courtsV2);

  const klerosCoreDeployment = await deployments.get("KlerosCore");
  const core = (await ethers.getContractAt("KlerosCore", klerosCoreDeployment.address)) as KlerosCore;

  for (const court of courtsV2) {
    // TODO: detect if the court already exist, if so, modify instead of create.
    if (court.id.eq(GENERAL_COURT)) {
      // General court, it already exist.
      // TODO: compare the court parameters before attempting to modify it.
      console.log("Skipping subcourt %d", court.id);
    } else {
      // Other courts, create them.
      console.log("Creating subcourt %d with %O", court.id, court);
      await core.createSubcourt(
        court.parent,
        court.hiddenVotes,
        court.minStake,
        court.alpha,
        court.feeForJuror,
        court.jurorsForCourtJump,
        [court.timesPerPeriod[0], court.timesPerPeriod[1], court.timesPerPeriod[2], court.timesPerPeriod[3]],
        5, // Not accessible on-chain, but has always been set to the same value so far.
        [DISPUTE_KIT_CLASSIC]
      );

      // console.log("Created: %O", await core.courts(court.id));
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
