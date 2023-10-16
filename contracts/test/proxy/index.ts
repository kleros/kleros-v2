import { expect } from "chai";
import { log } from "console";
import { ethers, deployments } from "hardhat";
import { DeployResult } from "hardhat-deploy/types";
import { deployUpgradableEXPERIMENTAL, deployUpgradableEXPERIMENTAL2 } from "../../deploy/utils/deployUpgradable";
import {
  UUPSUpgradableInitializableInheritanceV1,
  UUPSUpgradableInitializableInheritanceV2,
} from "../../typechain-types";

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

        // If the `governor` storage slot is not initialized in the constructor, trying to directly upgrade the implementation as `governor === address(0)`
        //   it("Should revert if upgrade is performed directly through the implementation", async () => {
        //     const UUPSUpgradeableMockV2Factory = await ethers.getContractFactory("UUPSUpgradeableMockV2");
        //     const newImplementation = await UUPSUpgradeableMockV2Factory.connect(deployer).deploy();

        //     await expect(implementation.connect(deployer).upgradeToAndCall(newImplementation.address, "0x")).to.be.revertedWith(
        //       "Must be called through delegatecall"
        //     );
        //   })
      });

      describe("Authentication", async () => {
        it("Only the governor (deployer here) can perform upgrades", async () => {
          // Unauthorized user try to upgrade the implementation
          const UUPSUpgradeableMockV2Factory = await ethers.getContractFactory("UUPSUpgradeableMockV2");
          const newUserImplementation = await UUPSUpgradeableMockV2Factory.connect(user1).deploy();

          await expect(proxy.connect(user1).upgradeToAndCall(newUserImplementation.address, "0x")).to.be.revertedWith(
            "No privilege to upgrade"
          );

          // Governor updates the implementation
          const newGovernorImplementation = await UUPSUpgradeableMockV2Factory.connect(deployer).deploy();
          console.log("Version: ", await proxy.version());

          await expect(proxy.connect(deployer).upgradeToAndCall(newGovernorImplementation.address, "0x"))
            .to.emit(proxy, "Upgraded")
            .withArgs(newGovernorImplementation.address);

          console.log("Version: ", await proxy.version());
        });
      });
    });

    describe("After Test", async () => {
      // Why?
      it("Reset implementation to deployment's implementation address", async () => {
        await proxy.upgradeToAndCall(proxyDeployment.implementation, "0x");
        console.log("Version: ", await proxy.version());
      });
    });
  });

  describe("State Initialization (rewritten with a new implementation)", async () => {
    before("Setup Contracts", async () => {
      [deployer] = await ethers.getSigners();

      proxyDeployment = await deployUpgradableEXPERIMENTAL(deployments, "UUPSUpgradableInitializable", {
        contract: "src/proxy/mock/UUPSUpgradableInitializable.sol:UUPSUpgradableInitializable",
        from: deployer.address,
        args: [deployer.address],
        log: true,
      });
      if (!proxyDeployment.implementation) {
        throw new Error("No implementation address");
      }
    });

    it("Implementation v1 is initialized", async () => {
      proxy = (await ethers.getContract("UUPSUpgradableInitializable")) as UUPSUpgradableInitializableInheritanceV1;

      implementation = (await ethers.getContract(
        "UUPSUpgradableInitializable_Implementation"
      )) as UUPSUpgradableInitializableInheritanceV1;

      expect(await proxy.governor()).to.equal(deployer.address);

      expect(await proxy.counter()).to.equal(1);
      await proxy.increment();
      expect(await proxy.counter()).to.equal(2);

      expect(await proxy.version()).to.equal("V1");

      // Implementation should not store any state
      expect(await implementation.counter()).to.equal(0);
    });

    it("Implementation upgraded to v2 and initialized", async () => {
      proxyDeployment = await deployUpgradableEXPERIMENTAL(deployments, "UUPSUpgradableInitializable", {
        contract: "src/proxy/mock/UUPSUpgradableInitializableV2.sol:UUPSUpgradableInitializable",
        from: deployer.address,
        args: ["Future of France"],
        log: true,
      });
      if (!proxyDeployment.implementation) {
        throw new Error("No implementation address");
      }
      proxy = (await ethers.getContract("UUPSUpgradableInitializable")) as UUPSUpgradableInitializableInheritanceV2;
      expect(await proxy.governor()).to.equal(deployer.address);

      expect(await proxy.counter()).to.equal(3);
      await proxy.increment();
      expect(await proxy.counter()).to.equal(4);

      expect(await proxy.version()).to.equal("V2");

      expect(await proxy.newVariable()).to.equal("Future of France");
    });
  });

  describe("State Initialization (inherits a new implementation)", async () => {
    before("Setup Contracts", async () => {
      [deployer] = await ethers.getSigners();

      proxyDeployment = await deployUpgradableEXPERIMENTAL(deployments, "UUPSUpgradableInitializableInheritanceV1", {
        from: deployer.address,
        args: [deployer.address],
        log: true,
      });
      if (!proxyDeployment.implementation) {
        throw new Error("No implementation address");
      }
    });

    it("Inheritance implementation v1 is initialized", async () => {
      proxy = (await ethers.getContract(
        "UUPSUpgradableInitializableInheritanceV1"
      )) as UUPSUpgradableInitializableInheritanceV1;

      implementation = (await ethers.getContract(
        "UUPSUpgradableInitializableInheritanceV1_Implementation"
      )) as UUPSUpgradableInitializableInheritanceV1;

      expect(await proxy.governor()).to.equal(deployer.address);

      expect(await proxy.counter()).to.equal(1);
      await proxy.increment();
      expect(await proxy.counter()).to.equal(2);

      expect(await proxy.version()).to.equal("V1");

      // Implementation should not store any state
      expect(await implementation.counter()).to.equal(0);
    });

    it("Inheritance implementation upgraded to v2 and initialized", async () => {
      proxyDeployment = await deployUpgradableEXPERIMENTAL2(
        deployments,
        "UUPSUpgradableInitializableInheritanceV1",
        "UUPSUpgradableInitializableInheritanceV2",
        "initializeV2",
        {
          from: deployer.address,
          args: ["Future of France"],
          log: true,
        }
      );

      proxy = (await ethers.getContract(
        "UUPSUpgradableInitializableInheritanceV1"
      )) as UUPSUpgradableInitializableInheritanceV2;

      expect(await proxy.governor()).to.equal(deployer.address);

      expect(await proxy.counter()).to.equal(3);
      await proxy.increment();
      expect(await proxy.counter()).to.equal(4);

      expect(await proxy.newVariable()).to.equal("Future of France");

      expect(await proxy.version()).to.equal("V2");
    });

    it("Inheritance implementation cannot upgrade to bad v3 initializer", async () => {
      await expect(
        deployUpgradableEXPERIMENTAL2(
          deployments,
          "UUPSUpgradableInitializableInheritanceV1",
          "UUPSUpgradableInitializableInheritanceV3Bad",
          "initializeV3",
          {
            from: deployer.address,
            args: [],
            log: true,
          }
        )
      ).to.be.revertedWithCustomError(proxy, "FailedDelegateCall");
    });
  });

  after("Reset", async () => {
    deployments.run([], { resetMemory: true, deletePreviousDeployments: true });
  });
});
