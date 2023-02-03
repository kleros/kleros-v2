// .load scripts/console-init.ts
core = await ethers.getContract("KlerosCore");
disputeKit = await ethers.getContract("DisputeKitClassic");
pnk = await ethers.getContract("PNK");
registry = await ethers.getContract("PolicyRegistry");
rng = await ethers.getContract("RandomizerRNG");
rng2 = await ethers.getContract("BlockHashRNG");
gateway = await ethers.getContract("HomeGatewayToGnosis");
sender = await ethers.getContract("FastBridgeSenderToGnosis");
options = { gasLimit: 10000000, gasPrice: 5000000000 };

console.log("core phase: %s", await core.phase());
console.log("disputekit phase: %s", await disputeKit.phase());
console.log("freezingPhase timeout? %s", await core.freezingPhaseTimeout());
