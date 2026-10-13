import fs from "fs";
import path from "path";
import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import hre from "hardhat";
import {
  ForeignGateway__factory,
  GatewayLightbulb__factory,
  HomeGateway__factory,
  KlerosCoreRuler,
  KlerosCoreRuler__factory,
} from "../../typechain-types";
import {
  DEPLOYMENT_NAMES,
  foreignProblems,
  homeProblems,
  lightbulbExtraData,
  MAINNET_DEFAULTS,
  mirrorProblems,
  readForeignGateway,
  readHomeGateway,
  setManualRuling,
  standInParameters,
  VeashiParameters,
} from "../../deploy/utils/veashi";
import { deployUpgradable } from "../../deploy/utils/deployUpgradable";
import configureVeashiForeignGateway from "../../deploy/12-veashi-foreign-configure";
import { ALL_TAGS, installStandIn, isolate, REPO_ROOT, runTags, STAND_IN_AXELAR_FEE, StandIn } from "./fixture";

const NATIVE = ethers.ZeroAddress;

async function contracts() {
  const [deployer] = await ethers.getSigners();
  const foreign = ForeignGateway__factory.connect(
    (await deployments.get(DEPLOYMENT_NAMES.foreignGateway)).address,
    deployer
  );
  const home = HomeGateway__factory.connect((await deployments.get(DEPLOYMENT_NAMES.homeGateway)).address, deployer);
  const lightbulb = GatewayLightbulb__factory.connect(
    (await deployments.get(DEPLOYMENT_NAMES.lightbulb)).address,
    deployer
  );
  const ruler = KlerosCoreRuler__factory.connect(await home.arbitrator(), deployer);
  return { deployer, foreign, home, lightbulb, ruler };
}

/** A KlerosCoreRuler proxy deployed outside the Veashi scripts (the "existing ruler" choice), with its own fee. */
async function existingRuler(feeForJuror: bigint): Promise<KlerosCoreRuler> {
  const [deployer] = await ethers.getSigners();
  const implementation = await (await ethers.getContractFactory("KlerosCoreRuler")).deploy();
  const init = implementation.interface.encodeFunctionData("initialize", [
    deployer.address,
    ethers.ZeroAddress,
    [0, 10_000, feeForJuror, 256],
  ]);
  const proxy = await (await ethers.getContractFactory("KlerosCoreRulerProxy")).deploy(implementation.target, init);
  return KlerosCoreRuler__factory.connect(await proxy.getAddress(), deployer);
}

describe("Veashi deploy scripts (in-process hardhat, stand-in parameters)", function () {
  this.timeout(120_000);
  isolate();

  describe("deploys through the three tags", () => {
    let standIn: StandIn;
    let p: VeashiParameters;

    beforeEach(async () => {
      standIn = await installStandIn();
      p = standInParameters();
      await runTags(ALL_TAGS);
    });

    it("configures the ForeignGateway as the parameters say", async () => {
      const { deployer, foreign, home, lightbulb } = await contracts();
      expect(await foreign.governor()).to.equal(deployer.address);
      expect(await foreign.keeper()).to.equal(standIn.keeper);
      expect(await foreign.homeGateway()).to.equal(await home.getAddress());
      expect(await foreign.homeChainID()).to.equal(p.homeChainId);
      expect(await foreign.yaho()).to.equal(standIn.addresses.foreign.yaho);
      expect(await foreign.yaru()).to.equal(standIn.addresses.foreign.yaru);
      expect(await foreign.oracleCount()).to.equal(3);
      for (let id = 0; id < 3; id++) {
        const oracle = await foreign.oracles(id);
        const want = standIn.addresses.foreign.oracles[id];
        expect([oracle.outboundReporter, oracle.outboundAdapter, oracle.inboundAdapter, oracle.enabled]).to.deep.equal([
          want.outboundReporter,
          want.outboundAdapter,
          want.inboundAdapter,
          true,
        ]);
        expect(await foreign.oracleBridgingCost(id)).to.equal(MAINNET_DEFAULTS.oracles[id].bridgingCost);
      }
      const defaults = await foreign.getDefaultOracles();
      expect(defaults.oracleIDs).to.deep.equal([0n, 1n, 2n]);
      expect(defaults.threshold).to.equal(2n);

      // The juror fee is on the court the Lightbulb's extraData names.
      const extraData = await lightbulb.arbitratorExtraData();
      expect(extraData).to.equal(lightbulbExtraData(p));
      const [court] = ethers.AbiCoder.defaultAbiCoder().decode(["uint256", "uint256"], extraData);
      expect(await foreign.feeForJuror(court)).to.equal(MAINNET_DEFAULTS.court.feeForJuror);
      expect(await lightbulb.gateway()).to.equal(await foreign.getAddress());

      const usdc = await foreign.currencyRates(MAINNET_DEFAULTS.usdc.address);
      expect(usdc.feePaymentAccepted).to.equal(true);
      expect(usdc.rateInEth).to.equal(MAINNET_DEFAULTS.usdc.rateInEth);
      expect(usdc.rateInEth > 0n).to.equal(true);
      expect(usdc.rateDecimals).to.equal(MAINNET_DEFAULTS.usdc.rateDecimals);
      expect(await foreign.homeNativeRate()).to.equal(10n ** 18n);

      const snapshot = await readForeignGateway(foreign, p);
      expect(
        foreignProblems(snapshot, p, {
          governor: deployer.address,
          homeGateway: await home.getAddress(),
        })
      ).to.deep.equal([]);
    });

    it("mirrors the ForeignGateway's oracles on the HomeGateway: same IDs, inbound and outbound swapped", async () => {
      const { deployer, foreign, home, ruler } = await contracts();
      expect(await home.arbitrator()).to.equal((await deployments.get(DEPLOYMENT_NAMES.ruler)).address);
      expect(await home.governor()).to.equal(deployer.address);
      expect(await home.foreignGateway()).to.equal(await foreign.getAddress());
      expect(await home.foreignChainID()).to.equal(p.foreignChainId);
      expect(await home.yaho()).to.equal(standIn.addresses.home.yaho);
      expect(await home.yaru()).to.equal(standIn.addresses.home.yaru);
      expect(await home.oracleCount()).to.equal(await foreign.oracleCount());
      for (let id = 0; id < 3; id++) {
        const [f, h] = [await foreign.oracles(id), await home.oracles(id)];
        expect(h.inboundAdapter).to.equal(f.outboundAdapter);
        expect(h.outboundAdapter).to.equal(f.inboundAdapter);
        expect(h.outboundReporter).to.equal(standIn.reporters.home[id]);
      }
      const [foreignSnapshot, homeSnapshot] = [await readForeignGateway(foreign, p), await readHomeGateway(home)];
      expect(mirrorProblems(foreignSnapshot, homeSnapshot)).to.deep.equal([]);
      const expected = {
        governor: deployer.address,
        arbitrator: await ruler.getAddress(),
        foreignGateway: await foreign.getAddress(),
      };
      expect(homeProblems(homeSnapshot, p, expected)).to.deep.equal([]);
    });

    it("sets the ruler's mode for the HomeGateway to manual, with the deployer as its ruler", async () => {
      const { deployer, home, ruler } = await contracts();
      expect(await ruler.rulers(await home.getAddress())).to.equal(deployer.address);
      expect((await ruler.settings(await home.getAddress())).rulingMode).to.equal(1n); // manual
      expect(await ruler.governor()).to.equal(deployer.address);
    });

    it("a Lightbulb requestSwitch creates a dispute whose fees appear in availableFees, split into juror and bridging fees", async () => {
      const { foreign, lightbulb } = await contracts();
      const [, user] = await ethers.getSigners();
      const extraData = await lightbulb.arbitratorExtraData();
      const cost = await foreign["arbitrationCost(bytes)"](extraData);
      const jurorFees = MAINNET_DEFAULTS.court.feeForJuror * MAINNET_DEFAULTS.court.minJurors;
      const bridgingFees = MAINNET_DEFAULTS.oracles.reduce((sum, o) => sum + o.bridgingCost, 0n);
      expect(cost).to.equal(jurorFees + bridgingFees);
      const before = await Promise.all(standIn.reporters.foreign.map((r) => ethers.provider.getBalance(r)));

      const tx = lightbulb.connect(user)["requestSwitch()"]({ value: cost });
      await expect(tx).to.emit(foreign, "CrossChainDisputeOutgoing");
      await expect(tx).to.emit(foreign, "DisputeRelayed");

      const [total, juror, bridging] = await foreign.availableFees(NATIVE);
      expect([total, juror, bridging]).to.deep.equal([cost, jurorFees, bridgingFees]);
      // Every selected reporter dispatched through Yaho and paid its fee from its own prefunded balance.
      const after = await Promise.all(standIn.reporters.foreign.map((r) => ethers.provider.getBalance(r)));
      after.forEach((balance, i) => expect(before[i] - balance).to.equal(STAND_IN_AXELAR_FEE));
    });

    it("the read-back fails when one oracle is swapped on the HomeGateway", async () => {
      const { deployer, foreign, home, ruler } = await contracts();
      const homeSnapshot = await readHomeGateway(home);
      const foreignSnapshot = await readForeignGateway(foreign, p);

      // In the snapshot: swap oracles 0 and 1.
      const swapped = {
        ...homeSnapshot,
        oracles: [homeSnapshot.oracles[1], homeSnapshot.oracles[0], homeSnapshot.oracles[2]],
      };
      expect(mirrorProblems(foreignSnapshot, swapped).join("\n")).to.match(/oracle 0: HomeGateway inbound adapter/);

      // On-chain: a HomeGateway registered with oracles 0 and 1 swapped, then the configure script pointed at it.
      const order = [1, 0, 2].map((i) => standIn.addresses.home.oracles[i]);
      const bad = await deployUpgradable(deployments, "VeashiHomeGatewaySwapped", {
        contract: "HomeGateway",
        proxyAlias: "UUPSProxy",
        from: deployer.address,
        args: [
          deployer.address,
          await ruler.getAddress(),
          p.foreignChainId,
          await foreign.getAddress(),
          standIn.addresses.home.yaho,
          standIn.addresses.home.yaru,
          order,
        ],
      });
      const badSnapshot = await readHomeGateway(HomeGateway__factory.connect(bad.address, deployer));
      const problems = mirrorProblems(foreignSnapshot, badSnapshot);
      expect(problems.join("\n")).to.match(/oracle 0: HomeGateway inbound adapter .* != ForeignGateway outbound/);
      expect(problems.join("\n")).to.match(/oracle 1: HomeGateway outbound adapter .* != ForeignGateway inbound/);
      expect(
        homeProblems(badSnapshot, p, {
          governor: deployer.address,
          arbitrator: await ruler.getAddress(),
          foreignGateway: await foreign.getAddress(),
        })
      ).to.not.deep.equal([]);

      const homeDeployment = await deployments.get(DEPLOYMENT_NAMES.homeGateway);
      await deployments.save(DEPLOYMENT_NAMES.homeGateway, {
        ...homeDeployment,
        address: bad.address,
      });
      await expect(configureVeashiForeignGateway(hre)).to.be.rejectedWith(/Veashi read-back failed \(gateway mirror\)/);
    });
  });

  describe("ruler choice ([O10])", () => {
    it("deploys a dedicated KlerosCoreRuler proxy by default, under a Veashi name, governed by the deployer", async () => {
      await installStandIn();
      await runTags(ALL_TAGS);
      const { deployer, home, ruler } = await contracts();
      const deployment = await deployments.get(DEPLOYMENT_NAMES.ruler);
      expect(await home.arbitrator()).to.equal(deployment.address);
      expect(await ruler.governor()).to.equal(deployer.address);
      expect((await ruler.courts(1)).feeForJuror).to.equal(MAINNET_DEFAULTS.court.feeForJuror);
      expect(await deployments.getOrNull("KlerosCoreRuler")).to.not.exist;
    });

    it("reuses an existing ruler without redeploying it and takes its manual mode for the HomeGateway", async () => {
      const existing = await existingRuler(MAINNET_DEFAULTS.court.feeForJuror);
      const address = await existing.getAddress();
      await installStandIn({ ruler: { kind: "existing", address } });
      await runTags(ALL_TAGS);
      const { deployer, home } = await contracts();
      expect(await home.arbitrator()).to.equal(address);
      expect(await deployments.getOrNull(DEPLOYMENT_NAMES.ruler)).to.not.exist;
      expect(await existing.rulers(await home.getAddress())).to.equal(deployer.address);
      expect((await existing.settings(await home.getAddress())).rulingMode).to.equal(1n);
    });

    it("rejects an existing ruler whose manual mode for the HomeGateway belongs to someone else", async () => {
      const existing = await existingRuler(MAINNET_DEFAULTS.court.feeForJuror);
      const [deployer, , , squatter] = await ethers.getSigners();
      await installStandIn({
        ruler: { kind: "existing", address: await existing.getAddress() },
      });
      await runTags(["VeashiForeign"]);
      // The HomeGateway proxy will be the deployer's second contract of the home script (implementation, then proxy).
      const nonce = await ethers.provider.getTransactionCount(deployer.address);
      const predicted = ethers.getCreateAddress({
        from: deployer.address,
        nonce: nonce + 1,
      });
      await (await existing.connect(squatter).changeRulingModeToManual(predicted)).wait();

      await expect(runTags(["VeashiHome"])).to.be.rejectedWith(
        /already names .* as the ruler of the HomeGateway .* is not accepted/
      );
      expect(await existing.rulers(predicted)).to.equal(squatter.address);
    });

    it("setManualRuling refuses a HomeGateway whose ruler is already another account", async () => {
      const existing = await existingRuler(MAINNET_DEFAULTS.court.feeForJuror);
      const [deployer, , , squatter] = await ethers.getSigners();
      const target = ethers.Wallet.createRandom().address;
      await (await existing.connect(squatter).changeRulingModeToManual(target)).wait();
      await expect(setManualRuling(existing, target, deployer.address)).to.be.rejectedWith(/is not accepted/);
    });

    it("stops before deploying the HomeGateway when the ruler's arbitration cost differs from the parameters", async () => {
      const existing = await existingRuler(MAINNET_DEFAULTS.court.feeForJuror * 2n);
      await installStandIn({
        ruler: { kind: "existing", address: await existing.getAddress() },
      });
      await runTags(["VeashiForeign"]);
      await expect(runTags(["VeashiHome"])).to.be.rejectedWith(/arbitration cost mismatch/);
      expect(await deployments.getOrNull(DEPLOYMENT_NAMES.homeGateway)).to.not.exist;
    });

    it("the ruler deployed from the mainnet fee and court charges the bot's referenceCaseCostEth for the Lightbulb ([L7])", async () => {
      const botConfig = JSON.parse(
        fs.readFileSync(path.join(REPO_ROOT, "bots", "gateway-balancer", "config", "mainnet.example.json"), "utf8")
      );
      const referenceCaseCostEth: string = botConfig.refill.pairs["base-arbitrum"].referenceCaseCostEth;
      await installStandIn(); // the stand-in keeps MAINNET_DEFAULTS' court, fee and ruler choice
      const p = standInParameters();
      expect(p.court).to.deep.equal(MAINNET_DEFAULTS.court);
      expect(p.ruler).to.deep.equal(MAINNET_DEFAULTS.ruler);
      await runTags(["VeashiForeign", "VeashiHome"]);
      const ruler = KlerosCoreRuler__factory.connect(
        (await deployments.get(DEPLOYMENT_NAMES.ruler)).address,
        ethers.provider
      );
      const extraData = await GatewayLightbulb__factory.connect(
        (await deployments.get(DEPLOYMENT_NAMES.lightbulb)).address,
        ethers.provider
      ).arbitratorExtraData();
      expect(await ruler["arbitrationCost(bytes)"](extraData)).to.equal(ethers.parseEther(referenceCaseCostEth));
    });
  });
});
