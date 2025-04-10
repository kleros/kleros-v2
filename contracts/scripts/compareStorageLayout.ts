import { task } from "hardhat/config";
import { readFileSync } from "fs";
import path from "path";
import { print } from "gluegun";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getStorageUpgradeReport, ValidationOptions } from "@openzeppelin/upgrades-core";

const { bold } = print.colors;

task("compare-storage", "Compare storage layout between deployed and modified contracts")
  .addParam("contract", "The name of the contract to compare against")
  .addOptionalParam("deployedArtifact", "The name of the deployed contract artifact in deployments")
  .setAction(async ({ deployedArtifact, contract }, hre: HardhatRuntimeEnvironment) => {
    try {
      // Get storage layout of the deployed contract implementation
      const artifactName = deployedArtifact || `${contract}_Implementation`;
      const deployedArtifactPath = path.resolve(`deployments/${hre.network.name}/${artifactName}.json`);
      const deployedJson = JSON.parse(readFileSync(deployedArtifactPath, "utf8"));
      const originalLayout = deployedJson.storageLayout;

      // Get storage layout of the modified contract
      const buildInfos = await hre.artifacts.getBuildInfoPaths();
      const buildInfo = buildInfos.find((buildInfo) => {
        const content = JSON.parse(readFileSync(buildInfo, "utf8"));
        return Object.keys(content.output.contracts).some((file) =>
          Object.keys(content.output.contracts[file]).includes(contract)
        );
      });

      if (!buildInfo) {
        throw new Error(`Could not find build info for contract ${contract}`);
      }

      const buildInfoContent = JSON.parse(readFileSync(buildInfo, "utf8"));
      const contractFile = Object.keys(buildInfoContent.output.contracts).find((file) =>
        Object.keys(buildInfoContent.output.contracts[file]).includes(contract)
      );

      if (!contractFile) {
        throw new Error(`Could not find contract ${contract} in build info`);
      }

      const contractData = buildInfoContent.output.contracts[contractFile][contract];
      const updatedLayout = contractData.storageLayout;

      // Compare layouts using OpenZeppelin's report
      const validationOptions: Required<ValidationOptions> = {
        unsafeAllowCustomTypes: true,
        unsafeAllowRenames: false,
        unsafeAllow: [],
        unsafeSkipStorageCheck: false,
        unsafeAllowLinkedLibraries: false,
        kind: "uups",
      };

      const report = getStorageUpgradeReport(originalLayout, updatedLayout, validationOptions);

      print.info(`\n${bold("Storage Layout Analysis:")}`);
      print.info("=".repeat(100));

      if (report.ok) {
        print.success("✓ No storage layout incompatibilities found");
        return;
      }

      const explanation = report.explain();
      print.error(`✗ ${explanation}`);
      print.info("-".repeat(100));
    } catch (error) {
      print.error("\nError comparing storage layouts:");
      print.error(error);
      process.exit(1);
    }
  });
