import env from "./utils/env";
import loggerFactory from "./utils/logger";
import hre = require("hardhat");
import { KlerosCore, DisputeResolver } from "../typechain-types";
import { BigNumber } from "ethers";
const { ethers } = hre;

const HEARTBEAT_URL = env.optionalNoDefault("HEARTBEAT_URL_DISPUTOR_BOT");
const loggerOptions = env.optionalNoDefault("LOGTAIL_TOKEN_DISPUTOR_BOT")
  ? {
      transportTargetOptions: {
        target: "@logtail/pino",
        options: { sourceToken: env.require("LOGTAIL_TOKEN_DISPUTOR_BOT") },
        level: env.optional("LOG_LEVEL", "info"),
      },
      level: env.optional("LOG_LEVEL", "info"), // for pino-pretty
    }
  : {};
const logger = loggerFactory.createLogger(loggerOptions);

export default async function main() {
  logger.info("Starting up");

  const core = (await ethers.getContract("KlerosCore")) as KlerosCore;
  const resolver = (await ethers.getContract("DisputeResolver")) as DisputeResolver;

  if (HEARTBEAT_URL) {
    logger.debug("Sending heartbeat");
    fetch(HEARTBEAT_URL);
  } else {
    logger.debug("Heartbeat not set up, skipping");
  }
  const extraData =
    "0x" +
    "0000000000000000000000000000000000000000000000000000000000000001" + // courtId 1
    "000000000000000000000000000000000000000000000000000000000000000B" + // minJurors 11
    "0000000000000000000000000000000000000000000000000000000000000002"; // disputeKitId 2
  const templates = [
    `{"title":"A reality.eth question","description":"A reality.eth question has been raised to arbitration.","question":"**Kleros Moderate:** Did the user, **degenape6** (ID: 1554345080), break the Telegram group, ***[Kleros Trading Group]()*** (ID: -1001151472172), ***[rules](https://ipfs.kleros.io/ipfs/Qme3Qbj9rKUNHUe9vj9rqCLnTVUCWKy2YfveQF8HiuWQSu/Kleros%20Moderate%20Community%20Rules.pdf)*** due to conduct related to the ***[message](https://t.me/c/1151472172/116662)*** (***[backup](https://ipfs.kleros.io/ipfs/QmVbFrZR1bcyQzZjvLyXwL9ekDxrqHERykdreRxXrw4nqg/animations_file_23.mp4)***)?","answers":[{"id":"0x01","title":"Yes","reserved":false},{"id":"0x02","title":"No","reserved":false},{"id":"0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF","title":"Answered Too Soon","reserved":true}],"policyURI":"/ipfs/QmZ5XaV2RVgBADq5qMpbuEwgCuPZdRgCeu8rhGtJWLV6yz","frontendUrl":"https://reality.eth.limo/app/#!/question/0xe78996a233895be74a66f451f1019ca9734205cc-0xe2a3bd38e3ad4e22336ac35b221bbbdd808d716209f84014c7bc3bf62f8e3b39","arbitrableChainID":"100","arbitrableAddress":"0x2e39b8f43d0870ba896f516f78f57cde773cf805","arbitratorChainID":"421614","arbitratorAddress":"0xD08Ab99480d02bf9C092828043f611BcDFEA917b","category":"Oracle","lang":"en_US","specification":"KIP99"}`,
    `{"title":"Add an entry to Ledger Contract Domain Name registry v2","description":"Someone requested to add an entry to Ledger Contract Domain Name registry v2","question":"Does the entry comply with the required criteria?","answers":[{"title":"Yes, Add It","description":"Select this if you think the entry complies with the required criteria and should be added."},{"title":"No, Don't Add It","description":"Select this if you think the entry does not comply with the required criteria and should not be added."}],"policyURI":"/ipfs/QmW3nQcMW2adyqe6TujRTYkyq26PiDqcmmTjdgKiz9ynPV","frontendUrl":"https://curate.kleros.io/tcr/100/0x957a53a994860be4750810131d9c876b2f52d6e1/0xc2c1aa705632f53051f22a9f65967c0944370020a7489aba608bd0d755ca1234","arbitratorChainID":"421614","arbitratorAddress":"0x791812B0B9f2ba260B2DA432BB02Ee23BC1bB509","category":"Curation","specification":"KIP0X","lang":"en_US"}`,
    `{"title":"Omen Question: News & Politics","description":"This reality dispute has been created by Omen, we advise you to read [the Omen Rules](https://cdn.kleros.link/ipfs/QmU1oZzsduGwtC7vCUQPw1QcBP6BDNDkg4t6zkowPucVcx) and consult the evidence provided in [the Market Comments](https://omen.eth.limo/#/0x95b2271039b020aba31b933039e042b60b063800).","question":"**Assuming that today is December 20th 2020, will Joe Biden win the 2020 United States presidential election?**","answers":[{"title":"Yes"},{"title":"No"}],"policyURI":"/ipfs/QmU1oZzsduGwtC7vCUQPw1QcBP6BDNDkg4t6zkowPucVcx","frontendUrl":"https://omen.eth.limo/#/0x95b2271039b020aba31b933039e042b60b063800","arbitratorChainID":"421614","arbitratorAddress":"0x791812B0B9f2ba260B2DA432BB02Ee23BC1bB509","category":"Oracle","specification":"KIP0X","lang":"en_US"}`,
    `{"title":"Proof of Humanity Registration Request","description":"A request to register the specified entry to a list of provable humans.","question":"Should the request to register be accepted?","answers":[{"title":"Yes","description":"Accept the request to register the entry."},{"title":"No","description":"Deny the request."}],"policyURI":"/ipfs/QmYPf2fdSyr9BiSy6pJFUmB1oTUPwg6dhEuFqL1n4ZosgH","frontendUrl":"https://app.proofofhumanity.id/profile/0x00de4b13153673bcae2616b67bf822500d325fc3?network=mainnet","arbitratorChainID":"421614","arbitratorAddress":"0x791812B0B9f2ba260B2DA432BB02Ee23BC1bB509","category":"Curated List","specification":"KIP0X","lang":"en_US"}`,
  ];
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
  const nbOfChoices = 2;
  const cost = (await core.functions["arbitrationCost(bytes)"](extraData)).cost;
  const tx = await resolver.createDisputeForTemplate(
    extraData,
    randomTemplate,
    "disputeTemplateMapping: TODO",
    nbOfChoices,
    {
      value: cost,
    }
  );

  logger.info(`Dispute creation tx: ${tx.hash}`);
  const blockNumber = await tx.wait().then((receipt) => receipt.blockNumber);
  const disputeId = await resolver
    .queryFilter(resolver.filters.DisputeRequest(), blockNumber, blockNumber)
    .then((events) => BigNumber.from(events[0].args[1]));
  logger.info(`Dispute created with disputeId ${disputeId.toString()}`);

  logger.info("Shutting down");
  await delay(2000); // Some log messages may be lost otherwise
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    logger.flush();
  });
