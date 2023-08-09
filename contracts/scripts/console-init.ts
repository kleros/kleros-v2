// .load scripts/console-init.ts
me = (await ethers.provider.listAccounts())[0];
core = await ethers.getContract("KlerosCore");
sortition = await hre.ethers.getContract("SortitionModule");
disputeKit = await ethers.getContract("DisputeKitClassic");
pnk = await ethers.getContract("PNK");
registry = await ethers.getContract("PolicyRegistry");
rng = await ethers.getContract("RandomizerRNG");
rng2 = await ethers.getContract("BlockHashRNG");
gateway = await ethers.getContract("HomeGatewayToGnosis");
resolver = await ethers.getContract("DisputeResolver");
faucet = await ethers.getContract("PNKFaucet");
sender = await ethers.getContract("VeaOutboxArbToGnosisDevnet");
options = { gasLimit: 10000000, gasPrice: 5000000000 };
var disputeID = 0;

console.log("sortition phase: %s", await sortition.phase());
console.log("freezingPhase timeout? %s", await core.freezingPhaseTimeout());

const relayCreateDispute = async (blockHash, foreignDisputeID) => {
  // const blockHash = "0xda3c4d74eeb199345b771748a930a069b172dac9f4b50697f40803581eb13990";
  // const foreignDisputeID = 6;
  const extraData =
    "0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000003";
  const fee = await core.arbitrationCost(extraData);
  var tx;
  try {
    tx = await (
      await gateway.relayCreateDispute(
        10200,
        blockHash,
        foreignDisputeID,
        2,
        extraData,
        "0x34E520dc1d2Db660113b64724e14CEdCD01Ee879",
        {
          value: fee,
          ...options,
        }
      )
    ).wait();
    console.log("txID: %s", tx?.transactionHash);

    disputeID = (
      await core.queryFilter(core.filters.DisputeCreation(), tx.blockNumber, tx.blockNumber)
    )[0].args._disputeID.toNumber();
    console.log("Using disputeID %d from now", disputeID);
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

    var filter = sender.filters.MessageReceived();
    var logs = await sender.queryFilter(filter, tx?.blockNumber, tx?.blockNumber);
    console.log("MessageReceived: %O", logs[0]?.args);
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

const epochPeriod = await sender.epochPeriod();

const epochID = async () => {
  return Math.floor((await ethers.provider.getBlock("latest")).timestamp / epochPeriod);
};

const anyBatchToSend = async () => {
  return await sender.batchSize();
};

const sendBatch = async () => {
  const before = await disputeKit.phase();
  var tx;
  try {
    tx = await (await sender.sendBatch(options)).wait();
    console.log("txID: %s", tx?.transactionHash);
  } catch (e) {
    if (typeof e === "string") {
      console.log("Error: %s", e);
    } else if (e instanceof Error) {
      console.log("%O", e);
    }
  } finally {
    const filter = sender.filters.BatchOutgoing();
    const logs = await sender.queryFilter(filter, tx.blockNumber, tx.blockNumber);
    console.log("BatchOutgoing: %O", logs[0]?.args);
  }
};

console.log("disputeID not set!");
