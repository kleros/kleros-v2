import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { IDisputeTemplateRegistry } from "../typechain-types";

task("get-dispute-template", "Gets a dispute template by ID")
  .addPositionalParam("templateId", "The ID of the template to query")
  .setAction(async function ({ templateId }: { templateId: string }, hre: HardhatRuntimeEnvironment) {
    const { ethers } = hre;

    // Get the contract instance
    const disputeTemplateRegistry = await ethers.getContract<IDisputeTemplateRegistry>("DisputeTemplateRegistry");

    // Query the events
    const filter = disputeTemplateRegistry.filters.DisputeTemplate(BigInt(templateId));
    const events = await disputeTemplateRegistry.queryFilter(filter);

    if (events.length === 0) {
      console.log(`No template found with ID ${templateId}`);
      return;
    }

    // Get the most recent event
    const event = events[events.length - 1];

    console.log("Template Details:");
    console.log("----------------");
    console.log(`Template ID: ${event.args._templateId}`);
    console.log(`Template Tag: ${event.args._templateTag}`);
    console.log(`Template Data: ${event.args._templateData}`);
    console.log(`Template Data Mappings: ${event.args._templateDataMappings}`);
  });
