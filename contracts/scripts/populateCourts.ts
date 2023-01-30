import { deployments, getNamedAccounts, getChainId, ethers } from "hardhat";
import { KlerosCore } from "../typechain-types";
import { BigNumber } from "ethers";
import courtsV1Mainnet from "../config/courts.v1.mainnet.json";
import courtsV1GnosisChain from "../config/courts.v1.gnosischain.json";

enum HomeChains {
  ARBITRUM_ONE = 42161,
  ARBITRUM_RINKEBY = 421611,
  ARBITRUM_GOERLI = 421613,
  HARDHAT = 31337,
}

const TESTING_PARAMETERS = true;
const FROM_GNOSIS = true;
const ETH_USD = BigNumber.from(1500);
const DISPUTE_KIT_CLASSIC = BigNumber.from(1);
const TEN_THOUSAND_GWEI = BigNumber.from(10).pow(13);

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

  const truncateWei = (x: BigNumber) => x.div(TEN_THOUSAND_GWEI).mul(TEN_THOUSAND_GWEI);

  const parametersUsdToEth = (court) => ({
    ...court,
    minStake: truncateWei(BigNumber.from(court.minStake).div(ETH_USD)),
    feeForJuror: truncateWei(BigNumber.from(court.feeForJuror).div(ETH_USD)),
  });

  const parametersProductionToTesting = (court) => ({
    ...court,
    minStake: truncateWei(BigNumber.from(court.minStake).div(10000)),
    feeForJuror: truncateWei(ethers.utils.parseEther("0.00001")),
    timesPerPeriod: [120, 120, 120, 120],
  });

  // WARNING: skip the Forking court at id 0, so the v1 courts are shifted by 1
  const parametersV1ToV2 = (court) => ({
    ...court,
    id: BigNumber.from(court.id).add(1),
    parent: BigNumber.from(court.parent).add(1),
  });

  let courtsV1 = FROM_GNOSIS ? courtsV1GnosisChain.map(parametersUsdToEth) : courtsV1Mainnet;
  courtsV1 = TESTING_PARAMETERS ? courtsV1.map(parametersProductionToTesting) : courtsV1;
  const courtsV2 = courtsV1.map(parametersV1ToV2);

  console.log("courtsV2 = %O", courtsV2);

  const klerosCoreDeployment = await deployments.get("KlerosCore");
  const core = (await ethers.getContractAt("KlerosCore", klerosCoreDeployment.address)) as KlerosCore;

  for (const court of courtsV2) {
    const courtPresent = await core.courts(court.id).catch(() => {});
    if (courtPresent) {
      console.log("Court %d found: %O", court.id, courtPresent);

      // Court.parent and sortitionSumTreeK cannot be changed.

      if (courtPresent.hiddenVotes !== court.hiddenVotes) {
        console.log(
          "Court %d: changing hiddenVotes from %d to %d",
          court.id,
          courtPresent.hiddenVotes,
          court.hiddenVotes
        );
        await core.changeCourtHiddenVotes(court.id, court.hiddenVotes);
      }

      if (!courtPresent.minStake.eq(court.minStake)) {
        console.log("Court %d: changing minStake from %d to %d", court.id, courtPresent.minStake, court.minStake);
        await core.changeCourtMinStake(court.id, court.minStake);
      }

      if (!courtPresent.alpha.eq(court.alpha)) {
        console.log("Court %d: changing alpha from %d to %d", court.id, courtPresent.alpha, court.alpha);
        await core.changeCourtAlpha(court.id, court.alpha);
      }

      if (!courtPresent.feeForJuror.eq(court.feeForJuror)) {
        console.log(
          "Court %d: changing feeForJuror from %d to %d",
          court.id,
          courtPresent.feeForJuror,
          court.feeForJuror
        );
        await core.changeCourtJurorFee(court.id, court.feeForJuror);
      }

      if (!courtPresent.jurorsForCourtJump.eq(court.jurorsForCourtJump)) {
        console.log(
          "Court %d: changing jurorsForCourtJump from %d to %d",
          court.id,
          courtPresent.jurorsForCourtJump,
          court.jurorsForCourtJump
        );
        await core.changeCourtJurorsForJump(court.id, court.jurorsForCourtJump);
      }

      const timesPerPeriodPresent = (await core.getTimesPerPeriod(court.id)).map((bn) => bn.toNumber());
      if (!timesPerPeriodPresent.every((val, index) => val === court.timesPerPeriod[index])) {
        console.log(
          "Court %d: changing timesPerPeriod from %O to %O",
          court.id,
          timesPerPeriodPresent,
          court.timesPerPeriod
        );
        await core.changeCourtTimesPerPeriod(court.id, [
          court.timesPerPeriod[0],
          court.timesPerPeriod[1],
          court.timesPerPeriod[2],
          court.timesPerPeriod[3],
        ]);
      }
    } else {
      console.log("Court %d not found, creating it with", court.id, court);
      await core.createCourt(
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
