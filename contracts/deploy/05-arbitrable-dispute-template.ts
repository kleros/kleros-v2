import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ArbitrableExample } from "../typechain-types";

const deployResolver: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers } = hre;

  const template = `{
    "$schema": "../NewDisputeTemplate.schema.json",
    "title": "Proof of Humanity Registration Request",
    "description": "A request to register the specified entry to a list of provable humans.",
    "question": "Should the request to register be accepted?",
    "answers": [
      {
        "title": "Yes",
        "description": "Accept the request to register the entry."
      },
      {
        "title": "No",
        "description": "Deny the request."
      }
    ],
    "policyURI": "/ipfs/QmXDiiBAizCPoLqHvcfTzuMT7uvFEe1j3s4TgoWWd4k5np/proof-of-humanity-registry-policy-v1.3.pdf",
    "frontendUrl": "https://app.proofofhumanity.id/profile/%s",
    "arbitrableChainID": "1",
    "arbitrableAddress": "0xc5e9ddebb09cd64dfacab4011a0d5cedaf7c9bdb",
    "arbitratorChainID": "421614",
    "arbitratorAddress": "0xD08Ab99480d02bf9C092828043f611BcDFEA917b",
    "category": "Curated Lists",
    "specification": "KIP88"
  }`;

  const arbitrable = (await ethers.getContract("ArbitrableExample")) as ArbitrableExample;
  let tx = await (await arbitrable.changeDisputeTemplate(template, "disputeTemplateMapping: TODO")).wait();
  tx.events?.forEach((event) => {
    console.log("event: %O", event.args);
  });
};

deployResolver.tags = ["ArbitrableDisputeTemplate"];

export default deployResolver;
