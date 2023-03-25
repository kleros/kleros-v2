export const options = { gasLimit: 10000000, gasPrice: 5000000000 };

export const getContracts = async (hre) => {
  const klerosCore = await hre.ethers.getContract("KlerosCore");
  const disputeKitClassic = await hre.ethers.getContract("DisputeKitClassic");
  const pnk = await hre.ethers.getContract("PNK");
  const randomizerRng = await hre.ethers.getContract("RandomizerRNG");
  const arbitrable = await hre.ethers.getContract("ArbitrableExampleEthFee");
  const randomizerMock = await hre.ethers.getContract("RandomizerMock");

  return {
    klerosCore,
    disputeKitClassic,
    pnk,
    randomizerRng,
    arbitrable,
    randomizerMock,
  };
};

export const handleError = (e: any) => {
  if (typeof e === "string") {
    console.log("Error: %s", e);
  } else if (e instanceof Error) {
    console.log("%O", e);
  }
};

export const getWallet = async (hre: any, walletIndex: number) => {
  const signers = await hre.ethers.getSigners();
  const wallet = signers[walletIndex];
  return { wallet };
};

export const isRngReady = async (wallet, hre) => {
  const { randomizerRng, disputeKitClassic } = await getContracts(hre);
  const requesterID = await randomizerRng.connect(wallet).requesterToID(disputeKitClassic.address);
  const n = await randomizerRng.connect(wallet).randomNumbers(requesterID);
  if (Number(n) === 0) {
    console.log("rng is NOT ready.");
    return false;
  } else {
    console.log("rng is ready: %s", n.toString());
    return true;
  }
};

export const mineBlocks = async (n, network) => {
  for (let index = 0; index < n; index++) {
    await network.provider.send("evm_mine", []);
  }
};
