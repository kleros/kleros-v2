import { deployments, getNamedAccounts, getChainId, ethers } from "hardhat";
import { KlerosCore } from "../typechain-types";
import { BigNumber } from "ethers";
import courtsV1 from "../courts.v1.json";

enum HomeChains {
  ARBITRUM_ONE = 42161,
  ARBITRUM_RINKEBY = 421611,
  ARBITRUM_GOERLI = 421613,
  HARDHAT = 31337,
}

const DISPUTE_KIT_CLASSIC = BigNumber.from(1);
const TESTING_PARAMETERS = false;

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
    minStake: TESTING_PARAMETERS ? BigNumber.from(court.minStake).div(100) : court.minStake,
    feeForJuror: TESTING_PARAMETERS ? ethers.utils.parseEther("0.001") : court.feeForJuror,
    timesPerPeriod: TESTING_PARAMETERS ? [120, 120, 120, 120] : court.timesPerPeriod,
  }));

  console.log("courtsV2 = %O", courtsV2);

  const klerosCoreDeployment = await deployments.get("KlerosCore");
  const core = (await ethers.getContractAt("KlerosCore", klerosCoreDeployment.address)) as KlerosCore;

  for (const court of courtsV2) {
    const subcourtPresent = await core.courts(court.id).catch(() => {});
    if (subcourtPresent) {
      console.log("Subcourt %d found: %O", court.id, subcourtPresent);

      // Subcourt.parent and sortitionSumTreeK cannot be changed.

      if (subcourtPresent.hiddenVotes !== court.hiddenVotes) {
        console.log(
          "Subcourt %d: changing hiddenVotes from %d to %d",
          court.id,
          subcourtPresent.hiddenVotes,
          court.hiddenVotes
        );
        await core.changeSubcourtHiddenVotes(court.id, court.hiddenVotes);
      }

      if (!subcourtPresent.minStake.eq(court.minStake)) {
        console.log("Subcourt %d: changing minStake from %d to %d", court.id, subcourtPresent.minStake, court.minStake);
        await core.changeSubcourtMinStake(court.id, court.minStake);
      }

      if (!subcourtPresent.alpha.eq(court.alpha)) {
        console.log("Subcourt %d: changing alpha from %d to %d", court.id, subcourtPresent.alpha, court.alpha);
        await core.changeSubcourtAlpha(court.id, court.alpha);
      }

      if (!subcourtPresent.feeForJuror.eq(court.feeForJuror)) {
        console.log(
          "Subcourt %d: changing feeForJuror from %d to %d",
          court.id,
          subcourtPresent.feeForJuror,
          court.feeForJuror
        );
        await core.changeSubcourtJurorFee(court.id, court.feeForJuror);
      }

      if (!subcourtPresent.jurorsForCourtJump.eq(court.jurorsForCourtJump)) {
        console.log(
          "Subcourt %d: changing jurorsForCourtJump from %d to %d",
          court.id,
          subcourtPresent.jurorsForCourtJump,
          court.jurorsForCourtJump
        );
        await core.changeSubcourtJurorsForJump(court.id, court.jurorsForCourtJump);
      }

      const timesPerPeriodPresent = (await core.getTimesPerPeriod(court.id)).map((bn) => bn.toNumber());
      if (!timesPerPeriodPresent.every((val, index) => val === court.timesPerPeriod[index])) {
        console.log(
          "Subcourt %d: changing timesPerPeriod from %O to %O",
          court.id,
          timesPerPeriodPresent,
          court.timesPerPeriod
        );
        await core.changeSubcourtTimesPerPeriod(court.id, [
          court.timesPerPeriod[0],
          court.timesPerPeriod[1],
          court.timesPerPeriod[2],
          court.timesPerPeriod[3],
        ]);
      }
    } else {
      console.log("Subcourt %d not found, creating it with", court.id, court);
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
