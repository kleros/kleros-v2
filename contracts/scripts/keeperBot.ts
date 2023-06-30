import { DisputeKitClassic, KlerosCore, PNK, RandomizerRNG, SortitionModule } from "../typechain-types";
import request from "graphql-request";
import hre = require("hardhat");
const { ethers } = hre;
const { BigNumber } = ethers;
const MAX_DRAW_ITERATIONS = 50;
const MAX_EXECUTE_ITERATIONS = 20;
const HIGH_GAS_LIMIT = { gasLimit: 20000000 };

const getContracts = async () => {
  const core = (await ethers.getContract("KlerosCore")) as KlerosCore;
  const sortition = (await ethers.getContract("SortitionModule")) as SortitionModule;
  const randomizerRng = (await ethers.getContract("RandomizerRNG")) as RandomizerRNG;
  const disputeKitClassic = (await ethers.getContract("DisputeKitClassic")) as DisputeKitClassic;
  const pnk = (await ethers.getContract("PNK")) as PNK;
  return { core, sortition, randomizerRng, disputeKitClassic, pnk };
};

const handleError = (e: any) => {
  if (typeof e === "string") {
    console.log("Error: %s", e);
  } else if (e instanceof Error) {
    console.log("%O", e);
  }
};

const isRngReady = async () => {
  const { randomizerRng, sortition } = await getContracts();
  const requesterID = await randomizerRng.requesterToID(sortition.address);
  const n = await randomizerRng.randomNumbers(requesterID);
  if (Number(n) === 0) {
    console.log("RandomizerRNG is NOT ready.");
    return false;
  } else {
    console.log("RandomizerRNG is ready: %s", n.toString());
    return true;
  }
};

const passPhase = async () => {
  const { sortition } = await getContracts();
  const before = await sortition.phase();
  try {
    const tx = await (await sortition.passPhase()).wait();
    console.log("passPhase txID: %s", tx?.transactionHash);
  } catch (e) {
    handleError(e);
  } finally {
    const after = await sortition.phase();
    console.log("passPhase: %d -> %d", before, after);
    return before !== after; // true if successful
  }
};

const passPeriod = async (dispute: { id: string }) => {
  const { core } = await getContracts();
  const before = (await core.disputes(dispute.id)).period;
  try {
    const tx = await (await core.passPeriod(dispute.id)).wait();
    console.log("passPeriod txID: %s", tx?.transactionHash);
  } catch (e) {
    handleError(e);
  } finally {
    const after = (await core.disputes(dispute.id)).period;
    console.log("passPeriod for dispute %s: %d -> %d", dispute.id, before, after);
    return before !== after; // true if successful
  }
};

const getMissingJurors = async (dispute: { id: string; currentRoundIndex: string }) => {
  const { core } = await getContracts();
  const { nbVotes, drawnJurors } = await core.getRoundInfo(dispute.id, dispute.currentRoundIndex);
  return nbVotes.sub(drawnJurors.length);
};

const isDisputeFullyDrawn = async (dispute: { id: string; currentRoundIndex: string }): Promise<boolean> => {
  return (await getMissingJurors(dispute)).eq(0);
};

const getNumberOfMissingRepartitions = async (
  dispute: { id: string; currentRoundIndex: string },
  coherentCount: BigNumber
) => {
  const { core } = await getContracts();
  const { repartitions, drawnJurors } = await core.getRoundInfo(dispute.id, dispute.currentRoundIndex);
  return coherentCount.eq(0)
    ? drawnJurors.length - repartitions.toNumber()
    : 2 * drawnJurors.length - repartitions.toNumber();
};

const mapAsync = <T, U>(array: T[], callbackfn: (value: T, index: number, array: T[]) => Promise<U>): Promise<U[]> => {
  return Promise.all(array.map(callbackfn));
};

const filterAsync = async <T>(
  array: T[],
  callbackfn: (value: T, index: number, array: T[]) => Promise<boolean>
): Promise<T[]> => {
  const filterMap = await mapAsync(array, callbackfn);
  return array.filter((value, index) => filterMap[index]);
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const { core, sortition, disputeKitClassic } = await getContracts();

  const getBlockTime = async () => {
    return await ethers.provider.getBlock("latest").then((block) => {
      return BigNumber.from(block.timestamp);
    });
  };

  const hasMinStakingTimePassed = async (): Promise<boolean> => {
    const minStakingTime = await sortition.minStakingTime();
    const blockTime = await getBlockTime();
    return await sortition.lastPhaseChange().then((lastPhaseChange) => {
      return blockTime.sub(lastPhaseChange).gt(minStakingTime);
    });
  };

  const hasMaxDrawingTimePassed = async (): Promise<boolean> => {
    const maxDrawingTime = await sortition.maxDrawingTime();
    const blockTime = await getBlockTime();
    return await sortition.lastPhaseChange().then((lastPhaseChange) => {
      return blockTime.sub(lastPhaseChange).gt(maxDrawingTime);
    });
  };

  const isPhaseStaking = async (): Promise<boolean> => {
    return (await sortition.phase()) === 0;
  };

  const isPhaseGenerating = async (): Promise<boolean> => {
    return (await sortition.phase()) === 1;
  };

  const isPhaseDrawing = async (): Promise<boolean> => {
    return (await sortition.phase()) === 2;
  };

  // get all the non-final disputes
  const nonFinalDisputesRequest = `{
    disputes(where: {period_not: execution}) {
      period
      id
      currentRoundIndex
    }
  }`;

  // TODO: use a local graph node if chainId is HARDHAT
  const result = await request(
    "https://api.thegraph.com/subgraphs/name/alcercu/kleroscoretest",
    nonFinalDisputesRequest
  );

  const { disputes } = result as { disputes: { period: string; id: string; currentRoundIndex: string }[] };
  for (var dispute of disputes) {
    console.log("dispute #%d, round #%d, period %s", dispute.id, dispute.currentRoundIndex, dispute.period);
  }

  const disputesWithoutJurors = await filterAsync(disputes, async (dispute) => {
    return !(await isDisputeFullyDrawn(dispute));
  });
  console.log(
    "disputes needing more jurors: %O",
    disputesWithoutJurors.map((dispute) => dispute.id)
  );

  // Just a sanity check
  const numberOfDisputesWithoutJurors = await sortition.disputesWithoutJurors();
  if (!numberOfDisputesWithoutJurors.eq(disputesWithoutJurors.length)) {
    console.log("ERROR: Discrepancy between SortitionModule.disputesWithoutJurors and KlerosCore.disputes");
    console.log("ERROR: KlerosCore.disputes without jurors = %d", disputesWithoutJurors.length);
    console.log("ERROR: SortitionModule.disputesWithoutJurors = %d", numberOfDisputesWithoutJurors);
  }

  if ((await hasMinStakingTimePassed()) && disputesWithoutJurors.length > 0) {
    console.log("Attempting to draw jurors");
    if (await isPhaseStaking()) {
      await passPhase();
    }
    if (await isPhaseGenerating()) {
      let maxDrawingTimePassed = false;
      do {
        console.log("Waiting for RNG to be ready");
        await delay(5000000); // 5 seconds
        maxDrawingTimePassed = await hasMaxDrawingTimePassed();
      } while (!(await isRngReady()) && !maxDrawingTimePassed);
      await passPhase();
    }
    if (await isPhaseDrawing()) {
      let maxDrawingTimePassed = await hasMaxDrawingTimePassed();
      for (dispute of disputesWithoutJurors) {
        if (maxDrawingTimePassed) {
          break;
        }
        let numberOfMissingJurors = await getMissingJurors(dispute);
        do {
          const drawIterations = Math.min(MAX_DRAW_ITERATIONS, numberOfMissingJurors.toNumber());
          console.log(
            "Drawing %d out of %d jurors needed for dispute #%d",
            drawIterations,
            numberOfMissingJurors,
            dispute.id
          );
          // break; // for testing
          await core.draw(dispute.id, drawIterations, HIGH_GAS_LIMIT);
          maxDrawingTimePassed = await hasMaxDrawingTimePassed();
          numberOfMissingJurors = await getMissingJurors(dispute);
        } while (!numberOfMissingJurors.eq(0) && !maxDrawingTimePassed);
      }
      // At this point, either all disputes are fully drawn or max drawing time has passed
      await passPhase();
    }
  }

  for (dispute of disputesWithoutJurors) {
    await passPeriod(dispute);

    const { period } = await core.disputes(dispute.id);
    if (period === 4) {
      // Execution period
      const coherentCount = await disputeKitClassic.getCoherentCount(dispute.id, dispute.currentRoundIndex);
      let numberOfMissingRepartitions = await getNumberOfMissingRepartitions(dispute, coherentCount);
      do {
        const executeIterations = Math.min(MAX_EXECUTE_ITERATIONS, numberOfMissingRepartitions);
        console.log(
          "Executing %d out of %d repartitions needed for dispute #%d",
          executeIterations,
          numberOfMissingRepartitions,
          dispute.id
        );
        // break; // for testing
        // const gasPrice = await ethers.provider.getGasPrice();
        // const gas = await core.estimateGas.execute(dispute.id, dispute.currentRoundIndex, executeIterations);
        await core.execute(dispute.id, dispute.currentRoundIndex, executeIterations, HIGH_GAS_LIMIT);
        numberOfMissingRepartitions = await getNumberOfMissingRepartitions(dispute, coherentCount);
      } while (numberOfMissingRepartitions != 0);

      console.log("Executing ruling for dispute #%d", dispute.id);
      await core.executeRuling(dispute.id);
    }
  }

  // if staking and any delayed stake, then execute sortition.executeDelayedStakes(iterations)
  // delayedStakes = 1 + delayedStakeWriteIndex - delayedStakeReadIndex
  const delayedStakes = BigNumber.from(1)
    .add(await sortition.delayedStakeWriteIndex())
    .sub(await sortition.delayedStakeReadIndex());

  if (await isPhaseStaking()) {
    if (delayedStakes.gt(0)) {
      console.log("Executing delayed stakes");
      await sortition.executeDelayedStakes(delayedStakes);
    } else {
      console.log("No delayed stakes to execute");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
