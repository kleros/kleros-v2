// .load scripts/console-init.ts
me = (await ethers.provider.listAccounts())[0];
core = await ethers.getContract("KlerosCore");
sortition = await hre.ethers.getContract("SortitionModule");
disputeKit = await ethers.getContract("DisputeKitClassic");
pnk = await ethers.getContract("PNK");
registry = await ethers.getContract("PolicyRegistry");
rng = await ethers.getContract("RandomizerRNG");
rng2 = await ethers.getContract("BlockHashRNG");
resolver = await ethers.getContract("DisputeResolver");
faucet = await ethers.getContract("PNKFaucet");
options = { gasLimit: 10000000, gasPrice: 5000000000 };
var disputeID = 0;

console.log("sortition phase: %s", await sortition.phase());
console.log("freezingPhase timeout? %s", await core.freezingPhaseTimeout());

const createDisputeOnResolver = async () => {
  const choices = 2;
  const nbOfJurors = 3;
  const feeForJuror = (await core.courts(1)).feeForJuror;
  var tx;
  try {
    tx = await (
      await resolver.createDispute(
        "0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000003",
        "",
        2,
        {
          value: feeForJuror.mul(nbOfJurors),
          ...options,
        }
      )
    ).wait();
    console.log("txID: %s", tx?.transactionHash);
  } catch (e) {
    if (typeof e === "string") {
      console.log("Error: %s", e);
    } else if (e instanceof Error) {
      console.log("%O", e);
    }
  } finally {
    if (tx) {
      const filter = core.filters.DisputeCreation();
      const logs = await core.queryFilter(filter, tx.blockNumber, tx.blockNumber);
      console.log("DisputeID: %s", logs[0]?.args?._disputeID);
    }
  }
};

const passPhase = async () => {
  const before = await sortition.phase();
  var tx;
  try {
    tx = await (await sortition.passPhase(options)).wait();
    console.log("txID: %s", tx?.transactionHash);
  } catch (e) {
    if (typeof e === "string") {
      console.log("Error: %s", e);
    } else if (e instanceof Error) {
      console.log("%O", e);
    }
  } finally {
    const after = await sortition.phase();
    console.log("Phase: %d -> %d", before, after);
  }
};

const passPeriod = async () => {
  const before = (await core.disputes(disputeID)).period;
  var tx;
  try {
    tx = await (await core.passPeriod(disputeID, options)).wait();
    console.log("txID: %s", tx?.transactionHash);
  } catch (e) {
    if (typeof e === "string") {
      console.log("Error: %s", e);
    } else if (e instanceof Error) {
      console.log("%O", e);
    }
  } finally {
    const after = (await core.disputes(disputeID)).period;
    console.log("Period for dispute %s: %d -> %d", disputeID, before, after);
  }
};

const drawJurors = async () => {
  var info = await core.getRoundInfo(disputeID, 0);
  console.log("Drawn jurors before: %O", info.drawnJurors);
  let tx;
  try {
    tx = await (await core.draw(disputeID, 10, options)).wait();
    console.log("txID: %s", tx?.transactionHash);
  } catch (e) {
    if (typeof e === "string") {
      console.log("Error: %s", e);
    } else if (e instanceof Error) {
      console.log("%O", e);
    }
  } finally {
    info = await core.getRoundInfo(disputeID, 0);
    console.log("Drawn jurors after: %O", info.drawnJurors);
  }
};

const isRngReady = async () => {
  const requesterID = await rng.requesterToID(disputeKit.address);
  const n = await rng.randomNumbers(requesterID);
  if (n.eq(0)) {
    console.log("rng is NOT ready.");
    return false;
  } else {
    console.log("rng is ready: %s", n.toString());
    return true;
  }
};

const getRoundInfo = async () => {
  console.log("%O", await core.getRoundInfo(disputeID, 0));
};

const executeRuling = async () => {
  let tx;
  try {
    tx = await (await core.execute(disputeID, 0, 10)).wait(); // redistribute
    console.log("txID execute: %s", tx?.transactionHash);

    tx = await (await core.executeRuling(disputeID)).wait(); // rule
    console.log("txID executeRuling: %s", tx?.transactionHash);
  } catch (e) {
    if (typeof e === "string") {
      console.log("Error: %s", e);
    } else if (e instanceof Error) {
      console.log("%O", e);
    }
  } finally {
    const dispute = await core.disputes(0);
    console.log("Ruled? %s", dispute.ruled);

    const ruling = await core.currentRuling(disputeID);
    console.log("Ruling: %d, Tied? %s, Overridden? %s", ruling.ruling, ruling.tied, ruling.overridden);
  }
};

const toVoting = async () => {
  console.log("Running for disputeID %d", disputeID);
  var ready;
  try {
    ready = await passPhaseCore().then(passPhaseDk).then(passPhaseDk).then(isRngReady);
  } catch (e) {
    ready = false;
  }
  while (!ready) {
    console.log("Waiting for RNG to be ready...", disputeID);
    await new Promise((r) => setTimeout(r, 10000));
    ready = await isRngReady();
  }
  console.log("RNG is ready, drawing jurors.", disputeID);
  await drawJurors().then(passPhaseDk).then(passPhaseCore).then(passPeriod);
};

console.log("disputeID not set!");
