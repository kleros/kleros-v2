// .load scripts/console-init-chiado.ts
receiver = await ethers.getContract("FastBridgeReceiverOnGnosis");
gateway = await ethers.getContract("ForeignGatewayOnGnosis");
weth = await ethers.getContract("WETH");
wethFaucet = await ethers.getContract("WETHFaucet");
wpnk = await ethers.getContract("WrappedPinakion");
wpnkFaucet = await ethers.getContract("WPNKFaucet");
xKlerosLiquidV2 = await ethers.getContract("xKlerosLiquidV2");
arbitrable = await ethers.getContract("ArbitrableExample");
options = {
  gasLimit: 10000000,
  maxFeePerGas: ethers.utils.parseUnits("1", "gwei"),
  maxPriorityFeePerGas: ethers.utils.parseUnits("1", "gwei"),
};

// dispute creation for 3 choices, 3 jurors
// await (await arbitrable.createDispute(3, "0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000003", 0, options)).wait()
