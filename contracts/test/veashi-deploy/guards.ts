import fs from "fs";
import os from "os";
import path from "path";
import { expect } from "chai";
import hre, { deployments, ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { Network } from "hardhat/types";
import deployVeashiForeignGateway from "../../deploy/10-veashi-foreign-gateway";
import deployVeashiHomeGateway from "../../deploy/11-veashi-home-gateway";
import configureVeashiForeignGateway from "../../deploy/12-veashi-foreign-configure";
import {
  counterpartDeployment,
  KEEPER_ENV,
  MAINNET_DEFAULTS,
  mainnetParameters,
  parameterProblems,
  resolveKeeper,
  standInParameters,
  VEASHI_TAGS,
} from "../../deploy/utils/veashi";
import { installStandIn, isolate, REPO_ROOT, runTags, syntheticHre } from "./fixture";

const SCRIPTS: Array<[string, DeployFunction, "base" | "arbitrum"]> = [
  ["10-veashi-foreign-gateway", deployVeashiForeignGateway, "base"],
  ["11-veashi-home-gateway", deployVeashiHomeGateway, "arbitrum"],
  ["12-veashi-foreign-configure", configureVeashiForeignGateway, "base"],
];
const CHAIN_IDS = { base: 8453, arbitrum: 42161 } as const;
const VALID_KEEPER = "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed"; // EIP-55 example

const network = (name: string, chainId: number, live = true) =>
  ({
    ...hre.network,
    name,
    live,
    config: { ...hre.network.config, chainId },
  }) as unknown as Network;

/** The SDK's route files, read directly: an oracle independent of the getters the parameters call. */
const sdkRoute = (source: number, destination: number): Record<string, string> =>
  JSON.parse(
    fs.readFileSync(
      path.join(
        REPO_ROOT,
        "node_modules",
        "@kleros",
        "veashi-sdk",
        "dist",
        "addresses",
        `${source}-${destination}.json`
      ),
      "utf8"
    )
  );

describe("Veashi deploy scripts: guards", function () {
  this.timeout(120_000);
  isolate();

  describe("keeper on a live network ([O12])", () => {
    const cases: Array<[string, string | undefined, RegExp]> = [
      ["missing", undefined, /VEASHI_KEEPER_ADDRESS is not set/],
      ["malformed", "0x1234", /VEASHI_KEEPER_ADDRESS is not a valid address/],
      ["bad checksum", "0x00000000000000000000000000000000000b07B0", /VEASHI_KEEPER_ADDRESS is not a valid address/],
      ["zero", ethers.ZeroAddress, /VEASHI_KEEPER_ADDRESS is the zero address/],
    ];
    for (const [script, deploy, chain] of SCRIPTS) {
      for (const [label, value, error] of cases) {
        it(`${script} refuses a ${label} keeper on a live ${chain} before any deployment or transaction`, async () => {
          if (value === undefined) delete process.env[KEEPER_ENV];
          else process.env[KEEPER_ENV] = value;
          const [deployer] = await ethers.getSigners();
          const nonce = await ethers.provider.getTransactionCount(deployer.address);
          const block = await ethers.provider.getBlockNumber();
          const recorded = Object.keys(await deployments.all());
          const { hre: live, spies } = syntheticHre(hre, chain, CHAIN_IDS[chain]);
          expect(await deploy.skip!(live)).to.equal(false); // it is the script's own chain
          await expect(deploy(live)).to.be.rejectedWith(error);
          expect(spies.calls).to.deep.equal([]);
          expect(await ethers.provider.getTransactionCount(deployer.address)).to.equal(nonce);
          expect(await ethers.provider.getBlockNumber()).to.equal(block);
          expect(Object.keys(await deployments.all())).to.deep.equal(recorded);
        });
      }
    }

    it("accepts a valid keeper and uses the stand-in only on the in-process hardhat network", () => {
      expect(resolveKeeper({ [KEEPER_ENV]: VALID_KEEPER })).to.equal(VALID_KEEPER);
      expect(resolveKeeper({ [KEEPER_ENV]: VALID_KEEPER.toLowerCase() })).to.equal(VALID_KEEPER);
      expect(() => resolveKeeper({})).to.throw(/is not set/);
      expect(resolveKeeper({}, VALID_KEEPER)).to.equal(VALID_KEEPER);
      expect(() => resolveKeeper({ [KEEPER_ENV]: "0xzz" }, VALID_KEEPER)).to.throw(/not a valid address/);
    });
  });

  describe("the other chain's deploy output on a live network", () => {
    const FOREIGN = "0x237FeF06261e45F39192f81B84F86e7Fb9d7Fedd";
    let dir: string;
    beforeEach(() => {
      dir = fs.mkdtempSync(path.join(os.tmpdir(), "veashi-deployments-"));
    });
    afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));
    /** A live Arbitrum whose deployments folder is a temporary directory, never contracts/deployments. */
    const liveArbitrum = () => {
      const synthetic = syntheticHre(hre, "arbitrum", CHAIN_IDS.arbitrum);
      const config = { ...hre.config, paths: { ...hre.config.paths, deployments: dir } };
      Object.defineProperty(synthetic.hre, "config", { value: config });
      return synthetic;
    };

    it("reads deployments/base/<name>.json by path, checks its chain id and names a missing file", async () => {
      const { hre: live } = liveArbitrum();
      const file = path.join(dir, "base", "VeashiForeignGateway.json");
      await expect(counterpartDeployment(live, "home", "VeashiForeignGateway")).to.be.rejectedWith(file);
      fs.mkdirSync(path.join(dir, "base"));
      fs.writeFileSync(file, JSON.stringify({ address: FOREIGN }));
      fs.writeFileSync(path.join(dir, "base", ".chainId"), "8453");
      expect((await counterpartDeployment(live, "home", "VeashiForeignGateway")).address).to.equal(FOREIGN);
      fs.writeFileSync(path.join(dir, "base", ".chainId"), "84532");
      await expect(counterpartDeployment(live, "home", "VeashiForeignGateway")).to.be.rejectedWith(
        /does not record chain 8453/
      );
    });

    it("the home script refuses before any transaction when the Base deploy output is missing", async () => {
      process.env[KEEPER_ENV] = VALID_KEEPER;
      const [deployer] = await ethers.getSigners();
      const nonce = await ethers.provider.getTransactionCount(deployer.address);
      const { hre: live, spies } = liveArbitrum();
      await expect(deployVeashiHomeGateway(live)).to.be.rejectedWith(/VeashiForeignGateway\.json does not exist/);
      expect(spies.calls).to.deep.equal([]);
      expect(await ethers.provider.getTransactionCount(deployer.address)).to.equal(nonce);
    });
  });

  describe("mainnet parameters", () => {
    it("resolve every Yaho, Yaru, reporter and adapter to the SDK's 8453 <-> 42161 addresses", () => {
      const p = mainnetParameters({ [KEEPER_ENV]: VALID_KEEPER });
      expect([p.set, p.foreignChainId, p.homeChainId, p.keeper]).to.deep.equal(["mainnet", 8453, 42161, VALID_KEEPER]);
      const baseToArbitrum = sdkRoute(8453, 42161); // Yaho and reporters on Base, Yaru and adapters on Arbitrum
      const arbitrumToBase = sdkRoute(42161, 8453); // Yaho and reporters on Arbitrum, Yaru and adapters on Base
      expect(p.oracles.map((o) => o.bridge)).to.deep.equal(["ccip", "lz", "axelar"]);
      expect(p.addresses.foreign.yaho).to.equal(baseToArbitrum.yaho);
      expect(p.addresses.foreign.yaru).to.equal(arbitrumToBase.yaru);
      expect(p.addresses.home.yaho).to.equal(arbitrumToBase.yaho);
      expect(p.addresses.home.yaru).to.equal(baseToArbitrum.yaru);
      p.oracles.forEach(({ bridge }, id) => {
        expect(p.addresses.foreign.oracles[id], `foreign ${bridge}`).to.deep.equal({
          outboundReporter: baseToArbitrum[`${bridge}Reporter`],
          outboundAdapter: baseToArbitrum[`${bridge}Adapter`],
          inboundAdapter: arbitrumToBase[`${bridge}Adapter`],
        });
        expect(p.addresses.home.oracles[id], `home ${bridge}`).to.deep.equal({
          outboundReporter: arbitrumToBase[`${bridge}Reporter`],
          outboundAdapter: arbitrumToBase[`${bridge}Adapter`],
          inboundAdapter: baseToArbitrum[`${bridge}Adapter`],
        });
      });
      expect(parameterProblems(p)).to.deep.equal([]);
    });

    it("keep the defaults the decisions name: CCIP 0, LayerZero 1, Axelar 2, selection [0,1,2], threshold 2", () => {
      expect(MAINNET_DEFAULTS.oracles.map((o) => o.id)).to.deep.equal([0, 1, 2]);
      expect(MAINNET_DEFAULTS.defaultOracleIds).to.deep.equal([0, 1, 2]);
      expect(MAINNET_DEFAULTS.defaultThreshold).to.equal(2);
      expect(MAINNET_DEFAULTS.ruler.kind).to.equal("deploy");
      for (const oracle of MAINNET_DEFAULTS.oracles) expect(oracle.bridgingCost > 0n).to.equal(true);
      expect(MAINNET_DEFAULTS.court.feeForJuror > 0n && MAINNET_DEFAULTS.usdc.rateInEth > 0n).to.equal(true);
    });
  });

  describe("parameter validation ([O11])", () => {
    const invalid: Array<[string, Partial<typeof MAINNET_DEFAULTS>, RegExp]> = [
      [
        "a duplicate oracle ID",
        {
          oracles: [
            MAINNET_DEFAULTS.oracles[0],
            { ...MAINNET_DEFAULTS.oracles[1], id: 0 },
            MAINNET_DEFAULTS.oracles[2],
          ],
        },
        /duplicate oracle ID/,
      ],
      ["an unknown default oracle ID", { defaultOracleIds: [0, 1, 3] }, /defaultOracleIds: unknown oracle ID 3/],
      ["a duplicate default oracle ID", { defaultOracleIds: [0, 1, 1] }, /defaultOracleIds: duplicate oracle ID 1/],
      ["a zero threshold", { defaultThreshold: 0 }, /defaultThreshold 0 is outside 1\.\.3/],
      [
        "a threshold above the selection",
        { defaultOracleIds: [0, 2], defaultThreshold: 3 },
        /defaultThreshold 3 is outside 1\.\.2/,
      ],
      [
        "a zero bridging cost",
        {
          oracles: MAINNET_DEFAULTS.oracles.map((o) => ({
            ...o,
            bridgingCost: o.id === 1 ? 0n : o.bridgingCost,
          })),
        },
        /oracles\[1\]: bridgingCost must be non-zero/,
      ],
      [
        "a zero juror fee",
        { court: { ...MAINNET_DEFAULTS.court, feeForJuror: 0n } },
        /court.feeForJuror must be non-zero/,
      ],
      ["a zero USDC rate", { usdc: { ...MAINNET_DEFAULTS.usdc, rateInEth: 0n } }, /usdc.rateInEth/],
      ["another homeNativeRate", { homeNativeRate: 2n * 10n ** 18n }, /homeNativeRate must be 1e18/],
    ];
    for (const [label, overrides, error] of invalid) {
      it(`rejects ${label} before any transaction`, async () => {
        await installStandIn(overrides);
        expect(() => standInParameters()).to.throw(error);
        const [deployer] = await ethers.getSigners();
        const nonce = await ethers.provider.getTransactionCount(deployer.address);
        for (const [, deploy] of SCRIPTS) await expect(deploy(hre)).to.be.rejectedWith(error);
        expect(await ethers.provider.getTransactionCount(deployer.address)).to.equal(nonce);
      });
    }
  });

  describe("chains", () => {
    const others: Array<[string, number, boolean]> = [
      ["mainnet", 1, true],
      ["arbitrumSepolia", 421614, true],
      ["sepolia", 11155111, true],
      ["gnosischain", 100, true],
      ["localhost", 31337, false],
    ];
    for (const [script, deploy, chain] of SCRIPTS) {
      it(`${script} skips on every chain but ${chain} and the in-process hardhat network`, async () => {
        const other = chain === "base" ? "arbitrum" : "base";
        expect(
          await deploy.skip!({
            network: network(chain, CHAIN_IDS[chain]),
          } as any)
        ).to.equal(false);
        expect(await deploy.skip!({ network: hre.network } as any)).to.equal(false);
        expect(
          await deploy.skip!({
            network: network(other, CHAIN_IDS[other]),
          } as any)
        ).to.equal(true);
        for (const [name, chainId, live] of others) {
          expect(
            await deploy.skip!({
              network: network(name, chainId, live),
            } as any),
            name
          ).to.equal(true);
        }
      });
    }
  });

  describe("tag isolation from the stale Vea-era scripts", () => {
    const deployDir = path.join(__dirname, "..", "..", "deploy");
    const VEASHI = SCRIPTS.map(([script]) => `${script}.ts`);
    type Script = {
      file: string;
      tags: string[];
      dependencies: string[];
      skip?: DeployFunction["skip"];
    };
    const scripts = (): Script[] =>
      fs
        .readdirSync(deployDir)
        .filter((file) => file.endsWith(".ts"))
        .map((file) => {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const loaded = require(path.join(deployDir, file));
          const func = loaded.default ?? loaded;
          return {
            file,
            tags: [func.tags ?? []].flat(),
            dependencies: func.dependencies ?? [],
            skip: func.skip,
          };
        });
    /** hardhat-deploy's selection: scripts carrying a requested tag, plus their dependency closure. */
    const selected = (all: Script[], tags: string[]): Script[] => {
      const chosen = new Set<Script>();
      const add = (script: Script) => {
        if (chosen.has(script)) return;
        chosen.add(script);
        for (const dependency of script.dependencies) all.filter((s) => s.tags.includes(dependency)).forEach(add);
      };
      all.filter((s) => s.tags.some((t) => tags.includes(t))).forEach(add);
      return [...chosen];
    };

    it("each Veashi script carries only its own tag and depends on no tag", () => {
      const byFile = Object.fromEntries(scripts().map((s) => [s.file, s]));
      expect(byFile["10-veashi-foreign-gateway.ts"]).to.include({
        file: "10-veashi-foreign-gateway.ts",
      });
      expect(byFile["10-veashi-foreign-gateway.ts"].tags).to.deep.equal([VEASHI_TAGS.foreign]);
      expect(byFile["11-veashi-home-gateway.ts"].tags).to.deep.equal([VEASHI_TAGS.home]);
      expect(byFile["12-veashi-foreign-configure.ts"].tags).to.deep.equal([VEASHI_TAGS.foreignConfigure]);
      for (const file of VEASHI) expect(byFile[file].dependencies).to.deep.equal([]);
    });

    it("a stale script's tag never selects a Veashi script, on Base or Arbitrum", async () => {
      const all = scripts();
      const stale = all.filter((s) => !VEASHI.includes(s.file) && s.tags.length > 0);
      expect(stale.map((s) => s.file)).to.include.members([
        "01-foreign-gateway-on-ethereum.ts",
        "02-home-gateway-to-ethereum.ts",
        "03-vea-mock.ts",
      ]);
      for (const script of stale) {
        for (const tag of script.tags) {
          expect(Object.values(VEASHI_TAGS)).to.not.include(tag);
          const files = selected(all, [tag]).map((s) => s.file);
          expect(
            files.filter((f) => VEASHI.includes(f)),
            `tag ${tag}`
          ).to.deep.equal([]);
        }
      }
    });

    it("a Veashi tag never selects a stale script, and its script stays skipped on the other chain", async () => {
      const all = scripts();
      for (const [file, tag, chain] of [
        ["10-veashi-foreign-gateway.ts", VEASHI_TAGS.foreign, "base"],
        ["11-veashi-home-gateway.ts", VEASHI_TAGS.home, "arbitrum"],
        ["12-veashi-foreign-configure.ts", VEASHI_TAGS.foreignConfigure, "base"],
      ] as const) {
        const chosen = selected(all, [tag]);
        expect(chosen.map((s) => s.file)).to.deep.equal([file]);
        const other = chain === "base" ? "arbitrum" : "base";
        expect(
          await chosen[0].skip!({
            network: network(other, CHAIN_IDS[other]),
          } as any)
        ).to.equal(true);
      }
    });

    it("running the stale ArbitrationRuler tag deploys no Veashi contract, and the Veashi tags deploy nothing else", async () => {
      await runTags(["ArbitrationRuler"]);
      const staleNames = Object.keys(await deployments.all());
      expect(staleNames).to.include("KlerosCoreRuler");
      expect(staleNames.filter((name) => name.startsWith("Veashi"))).to.deep.equal([]);

      await installStandIn();
      await runTags([VEASHI_TAGS.foreign, VEASHI_TAGS.home, VEASHI_TAGS.foreignConfigure]);
      const added = Object.keys(await deployments.all()).filter((name) => !staleNames.includes(name));
      expect(added.length).to.be.greaterThan(0);
      for (const name of added) expect(name, name).to.match(/^Veashi/);
      // The dedicated ruler is not the stale one.
      const [veashiRuler, staleRuler] = [
        await deployments.get("VeashiKlerosCoreRuler"),
        await deployments.get("KlerosCoreRuler"),
      ];
      expect(veashiRuler.address).to.not.equal(staleRuler.address);
    });
  });
});
