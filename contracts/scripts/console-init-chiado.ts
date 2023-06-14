// .load scripts/console-init-chiado.ts
receiver = await ethers.getContract("VeaInboxArbToGnosisDevnet");
gateway = await ethers.getContract("ForeignGatewayOnGnosis");
weth = await ethers.getContract("WETH");
wethFaucet = await ethers.getContract("WETHFaucet");
wpnk = await ethers.getContract("WrappedPinakionV2");
wpnkFaucet = await ethers.getContract("WPNKFaucet");
xKlerosLiquidV2 = await ethers.getContract("xKlerosLiquidV2");
arbitrable = await ethers.getContract("ArbitrableExample");
options = {
  gasLimit: 10000000,
  maxFeePerGas: ethers.utils.parseUnits("1", "gwei"),
  maxPriorityFeePerGas: ethers.utils.parseUnits("1", "gwei"),
};

// await weth.transfer(wethFaucet.address, ethers.utils.parseEther("100000"))
// await wethFaucet.request(options)

const createDispute = async () => {
  const choices = 2;
  const extraData =
    "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003";
  const metaEvidenceID = 0;
  const evidenceID = ethers.BigNumber.from(ethers.utils.randomBytes(32));
  const feeForJuror = await gateway.arbitrationCost(extraData);
  var tx;
  try {
    tx = await (await weth.increaseAllowance(arbitrable.address, feeForJuror, options)).wait();
    console.log("txID increateAllowance: %s", tx?.transactionHash);
    tx = await (
      await arbitrable.createDispute(choices, extraData, metaEvidenceID, evidenceID, feeForJuror, options)
    ).wait();
    console.log("txID createDispute: %s", tx?.transactionHash);
  } catch (e) {
    if (typeof e === "string") {
      console.log("Error: %s", e);
    } else if (e instanceof Error) {
      console.log("%O", e);
    }
  } finally {
    if (tx) {
      var filter = gateway.filters.DisputeCreation();
      var logs = await gateway.queryFilter(filter, tx.blockNumber, tx.blockNumber);
      console.log("Gateway DisputeID: %s", logs[0]?.args?._disputeID);

      filter = gateway.filters.OutgoingDispute();
      logs = await gateway.queryFilter(filter, tx.blockNumber, tx.blockNumber);
      console.log("Outgoing Dispute: %O", logs[0]?.args);
    }
  }
};

const epochPeriod = await receiver.epochPeriod();

const epochID = async () => {
  return Math.floor((await ethers.provider.getBlock("latest")).timestamp / epochPeriod);
};

const claim = async (epoch, merkleRoot) => {
  const deposit = await receiver.deposit();
  try {
    const tx = await (
      await receiver.claim(epoch, merkleRoot, {
        value: deposit,
        ...options,
      })
    ).wait();
    console.log("txID: %s", tx?.transactionHash);
  } catch (e) {
    if (typeof e === "string") {
      console.log("Error: %s", e);
    } else if (e instanceof Error) {
      console.log("%O", e);
    }
  }
};

const verifyBatch = async (epoch) => {
  var tx;
  try {
    tx = await (await receiver.verifyBatch(epoch, options)).wait();
    console.log("txID: %s", tx?.transactionHash);
  } catch (e) {
    if (typeof e === "string") {
      console.log("Error: %s", e);
    } else if (e instanceof Error) {
      console.log("%O", e);
    }
  } finally {
    const filter = receiver.filters.BatchVerified();
    const logs = await receiver.queryFilter(filter, tx?.blockNumber, tx?.blockNumber);
    console.log("BatchVerified: %O", logs[0]?.args);
  }
};

const verifyAndRelay = async (epoch, message) => {
  var tx;
  try {
    tx = await (await receiver.verifyAndRelayMessage(epoch, [], message, options)).wait();
    console.log("txID: %s", tx?.transactionHash);
  } catch (e) {
    if (typeof e === "string") {
      console.log("Error: %s", e);
    } else if (e instanceof Error) {
      console.log("%O", e);
    }
  } finally {
    var filter = receiver.filters.MessageRelayed();
    var logs = await receiver.queryFilter(filter, tx?.blockNumber, tx?.blockNumber);
    console.log("MessageRelayed: %O", logs[0]?.args);

    filter = arbitrable.filters.Ruling();
    logs = await arbitrable.queryFilter(filter, tx?.blockNumber, tx?.blockNumber);
    console.log("Ruling: %O", logs[0]?.args);
  }
};
