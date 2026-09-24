import { expect } from "chai";
import sinon from "sinon";
import { DisputeKitClassic } from "../../typechain-types";
import { getDisputeKit, withdrawAppealContribution } from "../../scripts/keeperBot";

/**
 * Regression tests for the keeper bot appeal-contribution withdrawal path.
 *
 * `withdrawFeesAndRewards` takes a `_coreDisputeID` / `_coreRoundID` pair and resolves
 * BOTH axes to local IDs internally (`DisputeKitClassicBase.sol:446-447`), so the bot
 * must hand it the core IDs. Passing the already-resolved local IDs makes the contract
 * resolve a second time, which either reverts or silently lands on an unrelated dispute
 * and refunds nothing.
 *
 * See https://github.com/kleros/kleros-v2/issues/2586.
 */
describe("keeperBot: withdrawAppealContribution", () => {
  // Core IDs deliberately diverge from local IDs. This is the situation that occurs
  // once disputes route to the Shutter/Gated dispute kits and the Classic kit's local
  // counter falls behind the core counter.
  const CORE_DISPUTE_ID = "282";
  const CORE_ROUND_ID = "1";
  const LOCAL_DISPUTE_ID = 248n;
  const LOCAL_ROUND_ID = 0n;

  const BENEFICIARY = "0x1234567890123456789012345678901234567890";
  const CHOICE = "2";

  const contribution = {
    contributor: { id: BENEFICIARY },
    choice: CHOICE,
    rewardWithdrawn: false,
    coreDispute: { currentRoundIndex: CORE_ROUND_ID },
  };

  let withdrawFeesAndRewards: sinon.SinonStub & {
    staticCall: sinon.SinonStub;
    estimateGas: sinon.SinonStub;
  };
  let disputeKit: DisputeKitClassic;
  let resolveDisputeKit: sinon.SinonStub;

  beforeEach(() => {
    withdrawFeesAndRewards = sinon.stub() as any;
    withdrawFeesAndRewards.staticCall = sinon.stub();
    withdrawFeesAndRewards.estimateGas = sinon.stub();

    disputeKit = { withdrawFeesAndRewards } as unknown as DisputeKitClassic;

    resolveDisputeKit = sinon.stub().resolves({
      disputeKit,
      localDisputeId: LOCAL_DISPUTE_ID,
      localRoundId: LOCAL_ROUND_ID,
    });
  });

  it("exposes getDisputeKit so the resolution step can be substituted in tests", () => {
    expect(getDisputeKit).to.be.a("function");
  });

  it("resolves the dispute kit from the core dispute and round IDs", async () => {
    withdrawFeesAndRewards.staticCall.resolves(0n);

    await withdrawAppealContribution(CORE_DISPUTE_ID, CORE_ROUND_ID, contribution, resolveDisputeKit as any);

    expect(resolveDisputeKit.calledOnceWithExactly(CORE_DISPUTE_ID, CORE_ROUND_ID)).to.equal(true);
  });

  it("withdraws and reports success when a nonzero amount is available", async () => {
    withdrawFeesAndRewards.staticCall.resolves(1000n);
    withdrawFeesAndRewards.estimateGas.resolves(100_000n);
    withdrawFeesAndRewards.resolves({ wait: async () => ({ hash: "0xdeadbeef" }) });

    const success = await withdrawAppealContribution(
      CORE_DISPUTE_ID,
      CORE_ROUND_ID,
      contribution,
      resolveDisputeKit as any
    );

    expect(success).to.equal(true);
    expect(withdrawFeesAndRewards.calledOnce).to.equal(true);
    expect(withdrawFeesAndRewards.firstCall.args.at(-1)).to.deep.equal({
      gasLimit: 150_000n, // estimateGas + 50%
    });
  });

  it("passes the core dispute and round IDs to withdrawFeesAndRewards, not the resolved local ones", async () => {
    withdrawFeesAndRewards.staticCall.resolves(1000n);
    withdrawFeesAndRewards.estimateGas.resolves(100_000n);
    withdrawFeesAndRewards.resolves({ wait: async () => ({ hash: "0xdeadbeef" }) });

    await withdrawAppealContribution(CORE_DISPUTE_ID, CORE_ROUND_ID, contribution, resolveDisputeKit as any);

    // The contract resolves both axes internally, so handing it the local IDs the
    // resolver just returned would resolve them a second time.
    const expectedArgs = [CORE_DISPUTE_ID, BENEFICIARY, CORE_ROUND_ID, CHOICE];
    expect(withdrawFeesAndRewards.staticCall.firstCall.args).to.deep.equal(expectedArgs);
    expect(withdrawFeesAndRewards.estimateGas.firstCall.args).to.deep.equal(expectedArgs);
    expect(withdrawFeesAndRewards.firstCall.args.slice(0, 4)).to.deep.equal(expectedArgs);
  });

  it("reports failure and sends no transaction when the static call reverts", async () => {
    withdrawFeesAndRewards.staticCall.rejects(new Error("DisputeNotResolved"));

    const success = await withdrawAppealContribution(
      CORE_DISPUTE_ID,
      CORE_ROUND_ID,
      contribution,
      resolveDisputeKit as any
    );

    expect(success).to.equal(false);
    expect(withdrawFeesAndRewards.estimateGas.called).to.equal(false);
    expect(withdrawFeesAndRewards.called).to.equal(false);
  });

  it("reports failure and sends no transaction when nothing is withdrawable", async () => {
    withdrawFeesAndRewards.staticCall.resolves(0n);

    const success = await withdrawAppealContribution(
      CORE_DISPUTE_ID,
      CORE_ROUND_ID,
      contribution,
      resolveDisputeKit as any
    );

    expect(success).to.equal(false);
    expect(withdrawFeesAndRewards.estimateGas.called).to.equal(false);
    expect(withdrawFeesAndRewards.called).to.equal(false);
  });
});
