import { ethers } from "hardhat";
import { IKlerosLiquid } from "../typechain-types";
import hre = require("hardhat");

interface Court {
  id: number;
  parent: number;
  hiddenVotes: boolean;
  minStake: number;
  alpha: number;
  feeForJuror: number;
  jurorsForCourtJump: number;
  timesPerPeriod: number[];
}

interface Config {
  courtAddress: string;
  maxCourts: number;
}

const configByChain = new Map<number, Config>([
  [
    1, // mainnet
    {
      courtAddress: "0x988b3A538b618C7A603e1c11Ab82Cd16dbE28069",
      maxCourts: 24,
    },
  ],
  [
    100, // gnosis
    {
      courtAddress: "0x9C1dA9A04925bDfDedf0f6421bC7EEa8305F9002",
      maxCourts: 18,
    },
  ],
]);

async function main() {
  const chainId = Number(await hre.getChainId());
  const courtAddress = configByChain.get(chainId)?.courtAddress ?? hre.ethers.constants.AddressZero;
  const courtsV1 = (await ethers.getContractAt("IKlerosLiquid", courtAddress)) as IKlerosLiquid;

  const courts: Court[] = [];
  const maxCourts = configByChain.get(chainId)?.maxCourts ?? 0;
  for (let courtId = 0; courtId < maxCourts; ++courtId) {
    const court: Court = await courtsV1.courts(courtId).then(
      (result) =>
        ({
          id: courtId,
          parent: result.parent.toNumber(),
          hiddenVotes: result.hiddenVotes,
          minStake: result.minStake.toString(),
          alpha: result.alpha.toString(),
          feeForJuror: result.feeForJuror.toString(),
          jurorsForCourtJump: result.jurorsForCourtJump.toString(),
          timesPerPeriod: [],
        } as unknown as Court)
    );

    court.timesPerPeriod = await courtsV1.getSubcourt(courtId).then((result) => {
      return result.timesPerPeriod.map((bn) => bn.toNumber());
    });

    court.id = courtId;

    // console.log("CourtId %d -> %O", courtId, court);

    courts.push(court);
  }
  console.log(JSON.stringify(courts, null, "\t"));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
