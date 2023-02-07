// .load scripts/console-init-chiado.ts
receiver = await ethers.getContract("FastBridgeReceiverOnGnosis");
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
  const metaEvidenceID = 2;
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
