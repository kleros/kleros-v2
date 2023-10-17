import { expect } from "chai";
import { log } from "console";
import { ethers, deployments } from "hardhat";
import { DeployResult } from "hardhat-deploy/types";
import { deployUpgradable } from "../../deploy/utils/deployUpgradable";
import { UpgradedByInheritanceV1, UpgradedByInheritanceV2 } from "../../typechain-types";
import { UpgradedByRewrite as UpgradedByRewriteV1 } from "../../typechain-types/src/proxy/mock/by-rewrite";
import { UpgradedByRewrite as UpgradedByRewriteV2 } from "../../typechain-types/src/proxy/mock/by-rewrite/UpgradedByRewriteV2.sol";

let deployer;
let user1;

let proxyDeployment: DeployResult;
let proxy;
let implementation;

describe("Upgradability", async () => {
  describe("Upgradability Permissions", async () => {
    beforeEach("Setup Contracts", async () => {
      [deployer, user1] = await ethers.getSigners();

      proxyDeployment = await deployments.deploy("UUPSUpgradeableMock", {
        from: deployer.address,
        proxy: {
          proxyContract: "UUPSProxy",
          execute: {
            init: {
              methodName: "initialize",
              args: [deployer.address],
            },
            onUpgrade: {
              methodName: "counter",
              args: [],
            },
          },
          proxyArgs: ["{implementation}", "{data}"],
        },
        log: true,
        args: [],
      });
      if (!proxyDeployment.implementation) {
        throw new Error("No implementation address");
      }
      proxy = await ethers.getContractAt("UUPSUpgradeableMock", proxyDeployment.address);
      implementation = await ethers.getContractAt("UUPSUpgradeableMock", proxyDeployment.implementation);
    });

    describe("Initialization", async () => {
      it("Governor cannot re-initialize the proxy", async () => {
        await expect(proxy.connect(deployer).initialize(deployer.address)).to.be.revertedWith(
          "Contract instance has already been initialized"
        );
      });
      it("User cannot re-initialize the proxy", async () => {
        await expect(proxy.connect(user1).initialize(user1.address)).to.be.revertedWith(
          "Contract instance has already been initialized"
        );
      });
      it("Implementation cannot be directly upgraded", async () => {
        await expect(implementation.initialize(user1.address)).to.be.revertedWith(
          "Contract instance has already been initialized"
        );
      });
    });
    describe("Upgrade", async () => {
      describe("Security", async () => {
        it("Should revert if implementation has a broken UUID", async () => {
          const UUPSUnsupportedProxiableUUIDFactory = await ethers.getContractFactory("UUPSUnsupportedProxiableUUID");
          const uupsUnsupportedUUID = await UUPSUnsupportedProxiableUUIDFactory.deploy();
          await expect(
            proxy.connect(deployer).upgradeToAndCall(uupsUnsupportedUUID.address, "0x")
          ).to.be.revertedWithCustomError(proxy, "UUPSUnsupportedProxiableUUID");
        });
        it("Should revert on upgrades to non UUPS-compliant implementation", async () => {
          const NonUpgradeableMockFactory = await ethers.getContractFactory("NonUpgradeableMock");
          const nonUpgradeableMock = await NonUpgradeableMockFactory.deploy();
          await expect(proxy.upgradeToAndCall(nonUpgradeableMock.address, "0x"))
            .to.be.revertedWithCustomError(proxy, "InvalidImplementation")
            .withArgs(nonUpgradeableMock.address);
        });
        it("Should revert if upgrade is performed directly through the implementation", async () => {
          // In the implementation, the `governor` storage slot is not initialized so `governor === address(0)`, which fails _authorizeUpgrade()
          const UUPSUpgradeableMockV2Factory = await ethers.getContractFactory("UUPSUpgradeableMockV2");
          const newImplementation = await UUPSUpgradeableMockV2Factory.connect(deployer).deploy();
          await expect(
            implementation.connect(deployer).upgradeToAndCall(newImplementation.address, "0x")
          ).to.be.revertedWith("No privilege to upgrade");
        });
      });

      describe("Authentication", async () => {
        it("Only the governor (deployer here) can perform upgrades", async () => {
          // Unauthorized user try to upgrade the implementation
          const UUPSUpgradeableMockV2Factory = await ethers.getContractFactory("UUPSUpgradeableMockV2");
          let upgradable = await UUPSUpgradeableMockV2Factory.connect(user1).deploy();
          await expect(proxy.connect(user1).upgradeToAndCall(upgradable.address, "0x")).to.be.revertedWith(
            "No privilege to upgrade"
          );

          // Governor updates the implementation
          upgradable = await UUPSUpgradeableMockV2Factory.connect(deployer).deploy();
          await expect(proxy.connect(deployer).upgradeToAndCall(upgradable.address, "0x"))
            .to.emit(proxy, "Upgraded")
            .withArgs(upgradable.address);
        });
      });
    });

    describe("After Test", async () => {
      // Why?
      it("Reset implementation to deployment's implementation address", async () => {
        await proxy.upgradeToAndCall(proxyDeployment.implementation, "0x");
      });
    });
  });

  describe("State Initialization (new implementation as a rewrite of the contract code)", async () => {
    before("Setup Contracts", async () => {
      [deployer] = await ethers.getSigners();

      proxyDeployment = await deployUpgradable(deployments, "UpgradedByRewrite", {
        contract: "src/proxy/mock/by-rewrite/UpgradedByRewrite.sol:UpgradedByRewrite",
        from: deployer.address,
        args: [deployer.address],
        log: true,
      });
      if (!proxyDeployment.implementation) {
        throw new Error("No implementation address");
      }
    });

    it("Initializes v1", async () => {
      proxy = (await ethers.getContract("UpgradedByRewrite")) as UpgradedByRewriteV1;

      implementation = (await ethers.getContract("UpgradedByRewrite_Implementation")) as UpgradedByRewriteV1;

      expect(await proxy.governor()).to.equal(deployer.address);

      expect(await proxy.counter()).to.equal(1);
      await proxy.increment();
      expect(await proxy.counter()).to.equal(2);

      expect(await proxy.version()).to.equal("V1");

      // Implementation should not store any state
      expect(await implementation.counter()).to.equal(0);
    });

    it("Upgrades to v2 and initializes", async () => {
      proxyDeployment = await deployUpgradable(deployments, "UpgradedByRewrite", {
        contract: "src/proxy/mock/by-rewrite/UpgradedByRewriteV2.sol:UpgradedByRewrite",
        from: deployer.address,
        args: ["Future of France"],
        log: true,
      });
      if (!proxyDeployment.implementation) {
        throw new Error("No implementation address");
      }
      proxy = (await ethers.getContract("UpgradedByRewrite")) as UpgradedByRewriteV2;
      expect(await proxy.governor()).to.equal(deployer.address);

      expect(await proxy.counter()).to.equal(3);
      await proxy.increment();
      expect(await proxy.counter()).to.equal(4);

      expect(await proxy.version()).to.equal("V2");

      expect(await proxy.newVariable()).to.equal("Future of France");
    });
  });

  describe("State Initialization (new implementation as a derived contract)", async () => {
    before("Setup Contracts", async () => {
      [deployer] = await ethers.getSigners();

      proxyDeployment = await deployUpgradable(deployments, "UpgradedByInheritanceV1", {
        from: deployer.address,
        args: [deployer.address],
        log: true,
      });
      if (!proxyDeployment.implementation) {
        throw new Error("No implementation address");
      }
    });

    it("Initializes v1", async () => {
      proxy = (await ethers.getContract("UpgradedByInheritanceV1")) as UpgradedByInheritanceV1;

      implementation = (await ethers.getContract("UpgradedByInheritanceV1_Implementation")) as UpgradedByInheritanceV1;

      expect(await proxy.governor()).to.equal(deployer.address);

      expect(await proxy.counter()).to.equal(1);
      await proxy.increment();
      expect(await proxy.counter()).to.equal(2);

      expect(await proxy.version()).to.equal("V1");

      // Implementation should not store any state
      expect(await implementation.counter()).to.equal(0);
    });

    it("Upgrades to v2 and initializes", async () => {
      proxyDeployment = await deployUpgradable(deployments, "UpgradedByInheritanceV1", {
        newImplementation: "UpgradedByInheritanceV2",
        initializer: "initializeV2",
        from: deployer.address,
        args: ["Future of France"],
        log: true,
      });

      proxy = (await ethers.getContract("UpgradedByInheritanceV1")) as UpgradedByInheritanceV2;

      expect(await proxy.governor()).to.equal(deployer.address);

      expect(await proxy.counter()).to.equal(3);
      await proxy.increment();
      expect(await proxy.counter()).to.equal(4);

      expect(await proxy.newVariable()).to.equal("Future of France");

      expect(await proxy.version()).to.equal("V2");
    });

    it("Cannot upgrade to v3 which has an invalid initializer", async () => {
      await expect(
        deployUpgradable(deployments, "UpgradedByInheritanceV1", {
          newImplementation: "UpgradedByInheritanceV3Bad",
          initializer: "initializeV3",
          from: deployer.address,
          args: [],
          log: true,
        })
      ).to.be.revertedWithCustomError(proxy, "FailedDelegateCall");
    });
  });

  after("Reset", async () => {
    deployments.run([], { resetMemory: true, deletePreviousDeployments: true });
  });
});
