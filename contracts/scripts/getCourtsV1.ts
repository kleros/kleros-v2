import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { IKlerosLiquid } from "../typechain-types";

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

async function main() {
  const courtsV1 = (await ethers.getContractAt(
    "IKlerosLiquid",
    "0x988b3A538b618C7A603e1c11Ab82Cd16dbE28069"
  )) as IKlerosLiquid;

  const courts: Court[] = [];
  for (let courtId = 0; courtId < 24; ++courtId) {
    const court: Court = await courtsV1.courts(courtId).then(
      (result) =>
        ({
          id: courtId,
          parent: result.parent.toString(),
          hiddenVotes: result.hiddenVotes,
          minStake: result.minStake.toString(),
          alpha: result.alpha.toString(),
          feeForJuror: result.feeForJuror.toString(),
          jurorsForCourtJump: result.feeForJuror.toString(),
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
