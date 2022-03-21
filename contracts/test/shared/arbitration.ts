import { randomInt } from ".";
import type { BigNumberish } from "ethers";
import { SignerWithAddress } from "hardhat-deploy-ethers/signers";
import { DisputeKitClassic, KlerosCore } from "../../typechain-types";

export interface SubcourtCreationParams {
  parent?: BigNumberish;
  hiddenVotes: boolean;
  minStake: BigNumberish;
  alpha: BigNumberish;
  feeForJuror: BigNumberish;
  jurorsForCourtJump: BigNumberish;
  timesPerPeriod: [BigNumberish, BigNumberish, BigNumberish, BigNumberish];
  sortitionSumTreeK: BigNumberish;
  supportedDisputeKit?: BigNumberish;
  children?: SubcourtCreationParams[];
}

function createCourtsTree(prevMinStake: number = 100, depth: number = 0) {
  const court = {
    alpha: randomInt(1, 1000),
    hiddenVotes: randomInt(0, 1) === 0,
    feeForJuror: randomInt(1, 100),
    jurorsForCourtJump: randomInt(3, 15),
    minStake: Math.max(randomInt(1, 100), prevMinStake),
    sortitionSumTreeK: randomInt(2, 5),
    timesPerPeriod: [...new Array(4)].map(() => randomInt(1, 5)) as [
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish
    ],
    children: [] as SubcourtCreationParams[],
  };

  if (depth < randomInt(1, 5)) {
    for (let i = 0; i < randomInt(1, 5); i++) {
      court.children.push(createCourtsTree(court.minStake as number, depth + 1));
    }
  }

  return court;
}

export const generateSubcourts = async (
  deployer: SignerWithAddress,
  core: KlerosCore,
  disputeKit: DisputeKitClassic,
  startingMinStake: number
) => {
  const subcourts: SubcourtCreationParams[] = [];
  const createSubcourts = async (courts: SubcourtCreationParams[]) => {
    const parentID = subcourts.length;
    for (const court of courts) {
      await core
        .connect(deployer)
        .createSubcourt(
          parentID,
          court.hiddenVotes,
          court.minStake,
          court.alpha,
          court.feeForJuror,
          court.jurorsForCourtJump,
          court.timesPerPeriod,
          court.sortitionSumTreeK,
          disputeKit.address
        );
      const courtChildren = court.children;
      delete court.children;
      court.parent = parentID;
      subcourts.push(court);
      if (courtChildren) await createSubcourts(courtChildren);
    }
  };
  await createSubcourts(createCourtsTree(startingMinStake).children!);
  return subcourts;
};

const packInt = (n: number) => n.toString(16).padStart(64, "0");

export const getDisputeExtraData = (subcourtID: number, numberOfJurors: number, disputeKitID: number) =>
  `0x${packInt(subcourtID)}${packInt(numberOfJurors)}${packInt(disputeKitID)}`;
