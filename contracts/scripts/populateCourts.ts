import { task, types } from "hardhat/config";
import { KlerosCore, KlerosCoreNeo, KlerosCoreUniversity } from "../typechain-types";
import { BigNumberish, toBigInt, toNumber } from "ethers";
import courtsV1Mainnet from "../config/courts.v1.mainnet.json";
import courtsV1GnosisChain from "../config/courts.v1.gnosischain.json";
import courtsV2ArbitrumTestnet from "../config/courts.v2.testnet.json";
import courtsV2ArbitrumDevnet from "../config/courts.v2.devnet.json";
import courtsV2MainnetNeo from "../config/courts.v2.mainnet-neo.json";
import { isDevnet } from "../deploy/utils";

enum HomeChains {
  ARBITRUM_ONE = 42161,
  ARBITRUM_SEPOLIA = 421614,
  HARDHAT = 31337,
}

enum Sources {
  V1_MAINNET,
  V1_GNOSIS,
  V2_DEVNET,
  V2_TESTNET,
  V2_MAINNET_NEO,
}

enum Cores {
  BASE,
  NEO,
  UNIVERSITY,
}

type Court = {
  id: number;
  parent: number;
  hiddenVotes: boolean;
  minStake: BigNumberish;
  alpha: BigNumberish;
  feeForJuror: BigNumberish;
  jurorsForCourtJump: BigNumberish;
  timesPerPeriod: BigNumberish[];
  supportedDisputeKits?: BigNumberish[];
};

const ETH_USD = 4000n;
const DISPUTE_KIT_CLASSIC = 1n;
const TEN_THOUSAND_GWEI = 10n ** 13n;

task("populate:courts", "Populates the courts and their parameters")
  .addOptionalParam(
    "from",
    "The source of the policies between v1_mainnet, v1_gnosis, v2_devnet, v2_testnet, v2_mainnet_neo (default: auto depending on the network)",
    undefined
  )
  .addOptionalParam("start", "The starting index for the courts to populate (default: 0)", 0, types.int)
  .addOptionalParam(
    "maxNumberOfCourts",
    "The maximum number of courts to populate (default: all)",
    undefined,
    types.int
  )
  .addOptionalParam(
    "coreType",
    "The type of core to use between base, neo, university (default: base)",
    Cores.BASE.toString()
  )
  .addFlag("reverse", "Iterates the courts in reverse order, useful to increase minStake in the child courts first")
  .addFlag("forceV1ParametersToDev", "Use development values for the v1 courts parameters")
  .setAction(async (taskArgs, hre) => {
    const { getNamedAccounts, getChainId, ethers, network } = hre;

    // fallback to hardhat node signers on local network
    const deployer = (await getNamedAccounts()).deployer ?? (await ethers.getSigners())[0].address;

    const chainId = Number(await getChainId());
    if (!HomeChains[chainId]) {
      console.error(`Aborting: script is not compatible with ${chainId}`);
      return;
    } else {
      console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);
    }

    let from: Sources | undefined;
    if (taskArgs.from) {
      from = Sources[taskArgs.from.toUpperCase() as keyof typeof Sources];
      if (from === undefined) {
        console.error("Invalid source, must be one of v1_mainnet, v1_gnosis, v2_devnet, v2_testnet, v2_mainnet_neo");
        return;
      }
    } else {
      from = isDevnet(network) ? Sources.V2_DEVNET : Sources.V2_TESTNET;
    }
    console.log("Populating from source %s", Sources[from]);

    let coreType = Cores.BASE;
    coreType = Cores[taskArgs.coreType.toUpperCase() as keyof typeof Cores];
    if (coreType === undefined) {
      console.error("Invalid core type, must be one of base, neo, university");
      return;
    }
    console.log("Using core type %s", Cores[coreType]);

    const truncateWei = (x: bigint) => (x / TEN_THOUSAND_GWEI) * TEN_THOUSAND_GWEI;

    const parametersUsdToEth = (court: Court): Court => ({
      ...court,
      minStake: truncateWei(toBigInt(court.minStake) / ETH_USD),
      feeForJuror: truncateWei(toBigInt(court.feeForJuror) / ETH_USD),
    });

    const parametersProductionToDev = (court: Court): Court => ({
      ...court,
      minStake: truncateWei(toBigInt(court.minStake) / 10000n),
      feeForJuror: truncateWei(ethers.parseEther("0.00001")),
      timesPerPeriod: [120, 120, 120, 240],
    });

    // WARNING: skip the Forking court at id 0, so the v1 courts are shifted by 1
    const parametersV1ToV2 = (court: Court): Court => ({
      ...court,
      id: court.id++,
      parent: court.parent++,
    });

    let courtsV2;
    switch (+from) {
      case Sources.V1_MAINNET: {
        let courtsV1: Court[] = courtsV1Mainnet;
        courtsV1 = taskArgs.forceV1ParametersToDev ? courtsV1.map(parametersProductionToDev) : courtsV1;
        courtsV2 = courtsV1.map(parametersV1ToV2);
        break;
      }
      case Sources.V1_GNOSIS: {
        let courtsV1: Court[] = courtsV1GnosisChain.map(parametersUsdToEth);
        courtsV1 = taskArgs.forceV1ParametersToDev ? courtsV1.map(parametersProductionToDev) : courtsV1;
        courtsV2 = courtsV1.map(parametersV1ToV2);
        break;
      }
      case Sources.V2_DEVNET: {
        courtsV2 = courtsV2ArbitrumDevnet;
        break;
      }
      case Sources.V2_TESTNET: {
        courtsV2 = courtsV2ArbitrumTestnet;
        break;
      }
      case Sources.V2_MAINNET_NEO: {
        courtsV2 = courtsV2MainnetNeo;
        break;
      }
      default:
        throw new Error("Unknown source");
    }

    // Warning: the indices are NOT the court IDs, e.g. the forking court is not present in the config so the indices are shifted by 1
    const start = taskArgs.start;
    const end = taskArgs.maxNumberOfCourts ? start + taskArgs.maxNumberOfCourts : courtsV2.length;
    console.log(`Keeping only the first ${end - start} courts, starting from ${start}`);
    courtsV2 = courtsV2.slice(start, end);

    if (taskArgs.reverse) {
      console.log("Reversing the order of courts");
      courtsV2.reverse();
    }

    console.log("courtsV2 = %O", courtsV2);

    let core: KlerosCore | KlerosCoreNeo | KlerosCoreUniversity;
    switch (coreType) {
      case Cores.UNIVERSITY:
        console.log("Using KlerosCoreUniversity");
        core = (await ethers.getContract("KlerosCoreUniversity")) as KlerosCoreUniversity;
        break;
      case Cores.NEO:
        console.log("Using KlerosCoreNeo");
        core = (await ethers.getContract("KlerosCoreNeo")) as KlerosCoreNeo;
        break;
      default:
        console.log("Using KlerosCore");
        core = (await ethers.getContract("KlerosCore")) as KlerosCore;
        break;
    }

    for (const court of courtsV2) {
      const courtPresent = await core.courts(court.id).catch(() => {});
      if (courtPresent) {
        console.log("Court %d found: %O", court.id, courtPresent);

        // Court.parent and sortitionSumTreeK cannot be changed.

        let change = false;

        if (courtPresent.hiddenVotes !== court.hiddenVotes) {
          change = true;
          console.log(
            "Court %d: changing hiddenVotes from %d to %d",
            court.id,
            courtPresent.hiddenVotes,
            court.hiddenVotes
          );
        }

        if (courtPresent.minStake !== toBigInt(court.minStake)) {
          change = true;
          console.log("Court %d: changing minStake from %d to %d", court.id, courtPresent.minStake, court.minStake);
        }

        if (courtPresent.alpha !== toBigInt(court.alpha)) {
          change = true;
          console.log("Court %d: changing alpha from %d to %d", court.id, courtPresent.alpha, court.alpha);
        }

        if (courtPresent.feeForJuror !== toBigInt(court.feeForJuror)) {
          change = true;
          console.log(
            "Court %d: changing feeForJuror from %d to %d",
            court.id,
            courtPresent.feeForJuror,
            court.feeForJuror
          );
        }

        if (courtPresent.jurorsForCourtJump !== toBigInt(court.jurorsForCourtJump)) {
          change = true;
          console.log(
            "Court %d: changing jurorsForCourtJump from %d to %d",
            court.id,
            courtPresent.jurorsForCourtJump,
            court.jurorsForCourtJump
          );
        }

        const timesPerPeriodPresent = (await core.getTimesPerPeriod(court.id)).map((bn) => toNumber(bn));
        if (!timesPerPeriodPresent.every((val, index) => val === court.timesPerPeriod[index])) {
          change = true;
          console.log(
            "Court %d: changing timesPerPeriod from %O to %O",
            court.id,
            timesPerPeriodPresent,
            court.timesPerPeriod
          );
        }

        if (!change) {
          console.log("Court %d: no parameter change", court.id);
          continue;
        }
        try {
          await core.changeCourtParameters(
            court.id,
            court.hiddenVotes,
            court.minStake,
            court.alpha,
            court.feeForJuror,
            court.jurorsForCourtJump,
            [court.timesPerPeriod[0], court.timesPerPeriod[1], court.timesPerPeriod[2], court.timesPerPeriod[3]]
          );
        } catch (error) {
          console.error("Error changing court parameters: %s", error);
        }
      } else {
        console.log("Court %d not found, creating it with", court.id, court);
        if (coreType === Cores.UNIVERSITY) {
          await (core as KlerosCoreUniversity).createCourt(
            court.parent,
            court.hiddenVotes,
            court.minStake,
            court.alpha,
            court.feeForJuror,
            court.jurorsForCourtJump,
            [court.timesPerPeriod[0], court.timesPerPeriod[1], court.timesPerPeriod[2], court.timesPerPeriod[3]],
            [DISPUTE_KIT_CLASSIC]
          );
        } else {
          await (core as KlerosCore).createCourt(
            court.parent,
            court.hiddenVotes,
            court.minStake,
            court.alpha,
            court.feeForJuror,
            court.jurorsForCourtJump,
            [court.timesPerPeriod[0], court.timesPerPeriod[1], court.timesPerPeriod[2], court.timesPerPeriod[3]],
            ethers.toBeHex(5), // Not accessible on-chain, but has always been set to the same value so far.
            [DISPUTE_KIT_CLASSIC]
          );
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  });
