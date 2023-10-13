import { expect } from "chai";
import { ethers, deployments } from "hardhat";

let deployer;
let user1;

let uupsProxyDeployment;
let uupsProxy;
let uupsImplementationInit;

describe("Mock Implementation Proxy", async () => {
  beforeEach("Setup Contracts", async () => {
    [deployer, user1] = await ethers.getSigners();
    // uupsProxyDeployment = await deployments.get("UUPSUpgradeableMock");

    // Deploy Proxy with hardhat-deploy
    uupsProxyDeployment = await deployments.deploy("UUPSUpgradeableMock", {
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
    uupsProxy = await ethers.getContractAt("UUPSUpgradeableMock", uupsProxyDeployment.address);
    uupsImplementationInit = await ethers.getContractAt("UUPSUpgradeableMock", uupsProxyDeployment.implementation);
    // console.log(uupsProxyDeployment.implementation);
  });

  describe("Initialization", async () => {
    it("Governor cannot re-initialize the proxy", async () => {
      await expect(uupsProxy.connect(deployer).initialize(deployer.address)).to.be.revertedWith(
        "Contract instance has already been initialized"
      );
    });
    it("User cannot re-initialize the proxy", async () => {
      await expect(uupsProxy.connect(user1).initialize(user1.address)).to.be.revertedWith(
        "Contract instance has already been initialized"
      );
    });
    it("Implementation cannot be directly upgraded", async () => {
      await expect(uupsImplementationInit.initialize(user1.address)).to.be.revertedWith(
        "Contract instance has already been initialized"
      );
    });
    // it("Unauthorized user cannot upgrade", async () => {});
  });
  describe("Upgrade", async () => {
    describe("Security", async () => {
      it("Should revert if implementation has a broken UUID", async () => {
        const UUPSUnsupportedProxiableUUIDFactory = await ethers.getContractFactory("UUPSUnsupportedProxiableUUID");
        const uupsUnsupportedUUID = await UUPSUnsupportedProxiableUUIDFactory.deploy();
        await expect(
          uupsProxy.connect(deployer).upgradeToAndCall(uupsUnsupportedUUID.address, "0x")
        ).to.be.revertedWithCustomError(uupsProxy, "UUPSUnsupportedProxiableUUID");
      });
      it("Should revert on upgrades to non UUPS-compliant implementation", async () => {
        const NonUpgradeableMockFactory = await ethers.getContractFactory("NonUpgradeableMock");
        const nonUpgradeableMock = await NonUpgradeableMockFactory.deploy();
        await expect(uupsProxy.upgradeToAndCall(nonUpgradeableMock.address, "0x"))
          .to.be.revertedWithCustomError(uupsProxy, "InvalidImplementation")
          .withArgs(nonUpgradeableMock.address);
      });

      // If the `governor` storage slot is not initialized in the constructor, trying to directly upgrade the implementation as `governor === address(0)`
      //   it("Should revert if upgrade is performed directly through the implementation", async () => {
      //     const UUPSUpgradeableMockV2Factory = await ethers.getContractFactory("UUPSUpgradeableMockV2");
      //     const newImplementation = await UUPSUpgradeableMockV2Factory.connect(deployer).deploy();

      //     await expect(uupsImplementationInit.connect(deployer).upgradeToAndCall(newImplementation.address, "0x")).to.be.revertedWith(
      //       "Must be called through delegatecall"
      //     );
      //   })
    });

    describe("Governance", async () => {
      it("Only the governor (deployer here) can perform upgrades", async () => {
        // Unauthorized user try to upgrade the implementation
        const UUPSUpgradeableMockV2Factory = await ethers.getContractFactory("UUPSUpgradeableMockV2");
        const newUserImplementation = await UUPSUpgradeableMockV2Factory.connect(user1).deploy();

        await expect(uupsProxy.connect(user1).upgradeToAndCall(newUserImplementation.address, "0x")).to.be.revertedWith(
          "No privilege to upgrade"
        );

        // Governor updates the implementation
        const newGovernorImplementation = await UUPSUpgradeableMockV2Factory.connect(deployer).deploy();
        console.log("Version: ", await uupsProxy.version());

        await expect(uupsProxy.connect(deployer).upgradeToAndCall(newGovernorImplementation.address, "0x"))
          .to.emit(uupsProxy, "Upgraded")
          .withArgs(newGovernorImplementation.address);

        console.log("Version: ", await uupsProxy.version());
      });
    });
  });

  describe("After Test", async () => {
    it("Reset  implementation to deployment's implementation address", async () => {
      await uupsProxy.upgradeToAndCall(uupsProxyDeployment.implementation, "0x");
      console.log("Version: ", await uupsProxy.version());
    });
  });
});
