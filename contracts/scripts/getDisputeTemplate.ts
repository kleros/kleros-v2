import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { IDisputeTemplateRegistry } from "../typechain-types";

task("get-dispute-template", "Gets a dispute template by ID")
  .addPositionalParam("templateId", "The ID of the template to query")
  .setAction(async ({ templateId }: { templateId: string }, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;

    // Get the contract instance
    const disputeTemplateRegistry = await ethers.getContract<IDisputeTemplateRegistry>("DisputeTemplateRegistry");

    // Query the events
    let events;
    try {
      const filter = disputeTemplateRegistry.filters.DisputeTemplate(BigInt(templateId));
      events = await disputeTemplateRegistry.queryFilter(filter);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Failed to query events for template ID ${templateId}:`, errorMessage);
      return;
    }

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
