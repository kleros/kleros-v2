import { expect } from "chai";
import sinon from "sinon";
import { DisputeKitClassic } from "../../typechain-types";
import {
  DisputeKitResolver,
  fetchAllPages,
  getAppealContributions,
  getDisputeKit,
  getDisputesWithContributionsNotYetWithdrawn,
  getDisputesWithUnexecutedRuling,
  getNonFinalDisputes,
  getUnstakedJurors,
  hasElapsed,
  Phase,
  shouldEnterDrawingBlock,
  SUBGRAPH_PAGE_SIZE,
  SubgraphRequest,
  withdrawAppealContribution,
} from "../../scripts/keeperBot";

/**
 * Regression tests for the keeper bot appeal-contribution withdrawal path.
 *
 * `withdrawFeesAndRewards(_coreDisputeID, _beneficiary, _choice)` resolves the local
 * dispute internally and sums the refund over all rounds, so the bot must hand it the
 * core dispute ID and the contribution's choice. Passing the already-resolved local
 * dispute ID either reverts or silently lands on an unrelated dispute, and passing the
 * round ID as the choice refunds the wrong ruling option.
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
    id: `1-${CORE_DISPUTE_ID}-${CORE_ROUND_ID}-${BENEFICIARY}-${CHOICE}`,
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
  let resolveDisputeKit: sinon.SinonStub<Parameters<DisputeKitResolver>, ReturnType<DisputeKitResolver>>;

  beforeEach(() => {
    withdrawFeesAndRewards = sinon.stub() as typeof withdrawFeesAndRewards;
    withdrawFeesAndRewards.staticCall = sinon.stub();
    withdrawFeesAndRewards.estimateGas = sinon.stub();

    disputeKit = { withdrawFeesAndRewards } as unknown as DisputeKitClassic;

    resolveDisputeKit = sinon.stub<Parameters<DisputeKitResolver>, ReturnType<DisputeKitResolver>>().resolves({
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

    await withdrawAppealContribution(CORE_DISPUTE_ID, CORE_ROUND_ID, contribution, resolveDisputeKit);

    expect(resolveDisputeKit.calledOnceWithExactly(CORE_DISPUTE_ID, CORE_ROUND_ID)).to.equal(true);
  });

  it("withdraws and reports success when a nonzero amount is available", async () => {
    withdrawFeesAndRewards.staticCall.resolves(1000n);
    withdrawFeesAndRewards.estimateGas.resolves(100_000n);
    withdrawFeesAndRewards.resolves({ wait: async () => ({ hash: "0xdeadbeef" }) });

    const success = await withdrawAppealContribution(CORE_DISPUTE_ID, CORE_ROUND_ID, contribution, resolveDisputeKit);

    expect(success).to.equal(true);
    expect(withdrawFeesAndRewards.calledOnce).to.equal(true);
    expect(withdrawFeesAndRewards.firstCall.args.at(-1)).to.deep.equal({
      gasLimit: 150_000n, // estimateGas + 50%
    });
  });

  it("passes the core dispute ID and the contribution choice to withdrawFeesAndRewards", async () => {
    withdrawFeesAndRewards.staticCall.resolves(1000n);
    withdrawFeesAndRewards.estimateGas.resolves(100_000n);
    withdrawFeesAndRewards.resolves({ wait: async () => ({ hash: "0xdeadbeef" }) });

    await withdrawAppealContribution(CORE_DISPUTE_ID, CORE_ROUND_ID, contribution, resolveDisputeKit);

    // The contract resolves the local dispute internally and sums over all rounds, so it takes
    // no round argument: the third parameter is the ruling option being withdrawn.
    const expectedArgs = [CORE_DISPUTE_ID, BENEFICIARY, CHOICE];
    expect(withdrawFeesAndRewards.staticCall.firstCall.args).to.deep.equal(expectedArgs);
    expect(withdrawFeesAndRewards.estimateGas.firstCall.args).to.deep.equal(expectedArgs);
    expect(withdrawFeesAndRewards.firstCall.args.slice(0, 3)).to.deep.equal(expectedArgs);
  });

  it("reports failure and sends no transaction when the static call reverts", async () => {
    withdrawFeesAndRewards.staticCall.rejects(new Error("DisputeNotResolved"));

    const success = await withdrawAppealContribution(CORE_DISPUTE_ID, CORE_ROUND_ID, contribution, resolveDisputeKit);

    expect(success).to.equal(false);
    expect(withdrawFeesAndRewards.estimateGas.called).to.equal(false);
    expect(withdrawFeesAndRewards.called).to.equal(false);
  });

  it("reports failure and sends no transaction when nothing is withdrawable", async () => {
    withdrawFeesAndRewards.staticCall.resolves(0n);

    const success = await withdrawAppealContribution(CORE_DISPUTE_ID, CORE_ROUND_ID, contribution, resolveDisputeKit);

    expect(success).to.equal(false);
    expect(withdrawFeesAndRewards.estimateGas.called).to.equal(false);
    expect(withdrawFeesAndRewards.called).to.equal(false);
  });
});

/**
 * Regression tests for the keeper bot drawing-phase entry gate.
 *
 * minStakingTime only gates the staking -> generating transition, and SortitionModule.passPhase()
 * uses inclusive `>=` boundaries. A keeper that started while the court was already in generating
 * or drawing used to skip the whole drawing workflow.
 *
 * See https://github.com/kleros/kleros-v2/issues/2574 and #2576.
 */
describe("keeperBot: drawing phase gate", () => {
  describe("hasElapsed", () => {
    const LAST_PHASE_CHANGE = 1_000n;
    const THRESHOLD = 60n;

    it("is false before the threshold", () => {
      expect(hasElapsed(LAST_PHASE_CHANGE + THRESHOLD - 1n, LAST_PHASE_CHANGE, THRESHOLD)).to.equal(false);
    });

    it("is true exactly at the threshold, matching the contract's >= boundary", () => {
      expect(hasElapsed(LAST_PHASE_CHANGE + THRESHOLD, LAST_PHASE_CHANGE, THRESHOLD)).to.equal(true);
    });

    it("is true after the threshold", () => {
      expect(hasElapsed(LAST_PHASE_CHANGE + THRESHOLD + 1n, LAST_PHASE_CHANGE, THRESHOLD)).to.equal(true);
    });
  });

  describe("shouldEnterDrawingBlock", () => {
    it("enters from staking once minStakingTime has passed", () => {
      expect(
        shouldEnterDrawingBlock({ phase: Phase.STAKING, disputesNeedingJurors: 1, minStakingTimePassed: true })
      ).to.equal(true);
    });

    it("does not enter from staking before minStakingTime has passed", () => {
      expect(
        shouldEnterDrawingBlock({ phase: Phase.STAKING, disputesNeedingJurors: 1, minStakingTimePassed: false })
      ).to.equal(false);
    });

    for (const phase of [Phase.GENERATING, Phase.DRAWING]) {
      it(`enters from ${phase} without waiting for minStakingTime`, () => {
        expect(shouldEnterDrawingBlock({ phase, disputesNeedingJurors: 1, minStakingTimePassed: false })).to.equal(
          true
        );
      });
    }

    for (const phase of [Phase.STAKING, Phase.GENERATING, Phase.DRAWING]) {
      it(`does not enter from ${phase} when no dispute needs jurors`, () => {
        expect(shouldEnterDrawingBlock({ phase, disputesNeedingJurors: 0, minStakingTimePassed: true })).to.equal(
          false
        );
      });
    }
  });
});

/**
 * Regression tests for the keeper bot subgraph queries.
 *
 * The Graph returns only the first 100 entities of a collection unless `first` is set (1000 max),
 * so the unpaginated queries silently dropped disputes and appeal contributions past that point.
 * The queries now page through the collection with an `id_gt` cursor.
 *
 * See https://github.com/kleros/kleros-v2/issues/2586.
 */
describe("keeperBot: subgraph pagination", () => {
  const entities = (count: number, offset = 0) => Array.from({ length: count }, (_, i) => ({ id: `${offset + i}` }));

  describe("fetchAllPages", () => {
    it("requests pages from an empty cursor and stops on the first empty page", async () => {
      const fetchPage = sinon.stub();
      fetchPage.onCall(0).resolves(entities(3));
      fetchPage.onCall(1).resolves([]);

      const result = await fetchAllPages(fetchPage);

      expect(result).to.have.length(3);
      expect(fetchPage.callCount).to.equal(2);
      expect(fetchPage.firstCall.args[0]).to.deep.equal({ first: SUBGRAPH_PAGE_SIZE, lastId: "" });
    });

    it("follows the id cursor from page to page", async () => {
      const fetchPage = sinon.stub();
      fetchPage.onCall(0).resolves([{ id: "a" }, { id: "b" }]);
      fetchPage.onCall(1).resolves([{ id: "c" }, { id: "d" }]);
      fetchPage.onCall(2).resolves([{ id: "e" }]);
      fetchPage.onCall(3).resolves([]);

      const result = await fetchAllPages(fetchPage, 2);

      expect(result.map(({ id }) => id)).to.deep.equal(["a", "b", "c", "d", "e"]);
      expect(fetchPage.args.map(([cursor]) => cursor)).to.deep.equal([
        { first: 2, lastId: "" },
        { first: 2, lastId: "b" },
        { first: 2, lastId: "d" },
        { first: 2, lastId: "e" },
      ]);
    });

    it("does not stop on a short page, so a lower `first` cap at the endpoint cannot truncate", async () => {
      const fetchPage = sinon.stub();
      fetchPage.onCall(0).resolves([{ id: "a" }]); // the endpoint capped `first: 2` down to 1
      fetchPage.onCall(1).resolves([{ id: "b" }]);
      fetchPage.onCall(2).resolves([]);

      const result = await fetchAllPages(fetchPage, 2);

      expect(result.map(({ id }) => id)).to.deep.equal(["a", "b"]);
    });

    it("throws instead of looping forever when the endpoint ignores the cursor", async () => {
      const fetchPage = sinon.stub().resolves([{ id: "a" }, { id: "b" }]);

      let error: unknown;
      try {
        await fetchAllPages(fetchPage, 2);
      } catch (e) {
        error = e;
      }

      expect((error as Error).message).to.contain("did not advance");
      expect(fetchPage.callCount).to.equal(2);
    });

    it("rejects rather than returning a partial result when a page fails", async () => {
      const fetchPage = sinon.stub();
      fetchPage.onCall(0).resolves([{ id: "a" }, { id: "b" }]);
      fetchPage.onCall(1).rejects(new Error("subgraph unavailable"));

      let error: unknown;
      try {
        await fetchAllPages(fetchPage, 2);
      } catch (e) {
        error = e;
      }

      expect(error).to.be.instanceOf(Error);
      expect((error as Error).message).to.equal("subgraph unavailable");
    });
  });

  describe("dispute queries", () => {
    const dispute = ({ id }: { id: string }) => ({ id, period: "execution", currentRoundIndex: "0" });

    const queries: [string, (request: SubgraphRequest) => Promise<{ id: string }[]>][] = [
      ["getNonFinalDisputes", getNonFinalDisputes],
      ["getDisputesWithUnexecutedRuling", getDisputesWithUnexecutedRuling],
    ];

    for (const [name, query] of queries) {
      it(`${name} returns disputes beyond the first page`, async () => {
        const firstPage = entities(SUBGRAPH_PAGE_SIZE).map(dispute);
        const secondPage = entities(150, SUBGRAPH_PAGE_SIZE).map(dispute);
        const request = sinon.stub();
        request.onCall(0).resolves({ disputes: firstPage });
        request.onCall(1).resolves({ disputes: secondPage });
        request.onCall(2).resolves({ disputes: [] });

        const disputes = await query(request as unknown as SubgraphRequest);

        expect(disputes).to.have.length(SUBGRAPH_PAGE_SIZE + 150);
        expect(request.callCount).to.equal(3);
        expect(request.firstCall.args[1]).to.deep.equal({ first: SUBGRAPH_PAGE_SIZE, lastId: "" });
        expect(request.secondCall.args[1]).to.deep.equal({
          first: SUBGRAPH_PAGE_SIZE,
          lastId: firstPage[firstPage.length - 1].id,
        });
      });
    }
  });

  describe("getDisputesWithContributionsNotYetWithdrawn", () => {
    const contribution = (id: string, disputeId: string) => ({
      id,
      coreDispute: { id: disputeId, period: "execution", currentRoundIndex: "1" },
    });

    it("filters by execution period in the subgraph, before the page limit applies", async () => {
      const request = sinon.stub().resolves({ classicContributions: [] });

      await getDisputesWithContributionsNotYetWithdrawn(request as unknown as SubgraphRequest);

      const query = (request.firstCall.args[0] as string).replace(/\s+/g, " ");
      expect(query).to.contain("coreDispute_: { period: execution }");
    });

    it("collects the disputes of every page, without duplicates", async () => {
      // A dispute with many contributions fills the first page, the next dispute is only on the second.
      const firstPage = entities(SUBGRAPH_PAGE_SIZE).map(({ id }) => contribution(`c${id}`, "282"));
      const secondPage = [contribution("x1", "282"), contribution("x2", "283")];
      const request = sinon.stub();
      request.onCall(0).resolves({ classicContributions: firstPage });
      request.onCall(1).resolves({ classicContributions: secondPage });
      request.onCall(2).resolves({ classicContributions: [] });

      const disputes = await getDisputesWithContributionsNotYetWithdrawn(request as unknown as SubgraphRequest);

      expect(disputes.map(({ id }) => id)).to.deep.equal(["282", "283"]);
      expect(request.secondCall.args[1]).to.deep.equal({
        first: SUBGRAPH_PAGE_SIZE,
        lastId: firstPage[firstPage.length - 1].id,
      });
    });
  });

  describe("getAppealContributions", () => {
    it("pages through the contributions of the dispute", async () => {
      const contribution = ({ id }: { id: string }) => ({
        id,
        contributor: { id: "0x1234567890123456789012345678901234567890" },
        choice: "1",
        rewardWithdrawn: false,
        coreDispute: { currentRoundIndex: "2" },
      });
      const firstPage = entities(SUBGRAPH_PAGE_SIZE).map(contribution);
      const request = sinon.stub();
      request.onCall(0).resolves({ contributions: firstPage });
      request.onCall(1).resolves({ contributions: entities(5, SUBGRAPH_PAGE_SIZE).map(contribution) });
      request.onCall(2).resolves({ contributions: [] });

      const contributions = await getAppealContributions("282", request as unknown as SubgraphRequest);

      expect(contributions).to.have.length(SUBGRAPH_PAGE_SIZE + 5);
      expect(request.firstCall.args[1]).to.deep.equal({ disputeId: "282", first: SUBGRAPH_PAGE_SIZE, lastId: "" });
      expect(request.secondCall.args[1]).to.deep.equal({
        disputeId: "282",
        first: SUBGRAPH_PAGE_SIZE,
        lastId: firstPage[firstPage.length - 1].id,
      });
    });
  });
});

describe("keeperBot: getUnstakedJurors", () => {
  const dispute = { id: "282", currentRoundIndex: "1" };
  const draw = (id: string, userAddress: string) => ({ id, juror: { userAddress } });

  it("queries the draws of the current round by dispute and round ID, and deduplicates jurors", async () => {
    const request = sinon.stub();
    request
      .onCall(0)
      .resolves({ draws: [draw("282-1-0", "0xaaa"), draw("282-1-1", "0xbbb"), draw("282-1-2", "0xaaa")] });
    request.onCall(1).resolves({ draws: [] });

    const jurors = await getUnstakedJurors(dispute, request as unknown as SubgraphRequest);

    expect(jurors).to.deep.equal(["0xaaa", "0xbbb"]);
    expect(request.firstCall.args[1]).to.deep.equal({
      disputeId: "282",
      roundId: "282-1",
      first: SUBGRAPH_PAGE_SIZE,
      lastId: "",
    });
    expect(request.secondCall.args[1]).to.include({ lastId: "282-1-2" });
  });

  it("returns an empty list when the round has no unstaked juror", async () => {
    const request = sinon.stub().resolves({ draws: [] });

    expect(await getUnstakedJurors(dispute, request as unknown as SubgraphRequest)).to.deep.equal([]);
  });
});
