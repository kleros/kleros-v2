export const options = { gasLimit: 10000000, gasPrice: 5000000000 };

export const getContracts = async (hre) => {
  const klerosCore = await hre.ethers.getContract("KlerosCore");
  const disputeKitClassic = await hre.ethers.getContract("DisputeKitClassic");
  const pnk = await hre.ethers.getContract("PNK");
  const randomizerRng = await hre.ethers.getContract("RandomizerRNG");
  const arbitrable = await hre.ethers.getContract("ArbitrableExampleEthFee");

  return {
    klerosCore,
    disputeKitClassic,
    pnk,
    randomizerRng,
    arbitrable,
  };
};

export const handleError = (e: any) => {
  if (typeof e === "string") {
    console.log("Error: %s", e);
  } else if (e instanceof Error) {
    console.log("%O", e);
  }
};

export const getWalletAndProvider = async (hre: any, walletIndex: number, network: string) => {
  const provider = hre.ethers.providers.getNetwork(network);
  const signers = await hre.ethers.getSigners();
  const wallet = signers[walletIndex];
  return { wallet, provider };
};

export const isRngReady = async (provider: any, hre) => {
  const { randomizerRng, disputeKitClassic } = await getContracts(hre);
  const connectedRandomizerRng = randomizerRng.connect(provider);
  const requesterID = await connectedRandomizerRng.requesterToID(disputeKitClassic.address);
  const n = await connectedRandomizerRng.randomNumbers(requesterID);
  if (Number(n) === 0) {
    console.log("rng is NOT ready.");
    return false;
  } else {
    console.log("rng is ready: %s", n.toString());
    return true;
  }
};
