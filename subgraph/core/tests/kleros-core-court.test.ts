import { afterEach, assert, clearStore, dataSourceMock, describe, test } from "matchstick-as/assembly/index";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  handleAcceptedFeeToken,
  handleCourtCreated,
  handleCourtJump,
  handleCourtModified,
  handleDisputeKitCreated,
  handleDisputeKitEnabled,
} from "../src/KlerosCore";
import { filterSupportedDisputeKits } from "../src/entities/DisputeKit";
import {
  createAcceptedFeeTokenEvent,
  createCourtCreatedEvent,
  createCourtJumpEvent,
  createCourtModifiedEvent,
  createDisputeKitCreatedEvent,
  createDisputeKitEnabledEvent,
} from "./utils/events";
import { mockRates } from "./utils/mocks";
import { seedCourt, seedDisputeInCourt } from "./utils/entities";
import { bi, CHILD_COURT, DK_CLASSIC, ERC20_TOKEN, GENERAL_COURT } from "./utils/constants";

const ELIGIBILITY = Address.fromString("0x1111111111111111111111111111111111111111");

function times(a: i32, b: i32, c: i32, d: i32): BigInt[] {
  return [bi(a), bi(b), bi(c), bi(d)];
}

describe("KlerosCore - handleCourtCreated", () => {
  afterEach(() => {
    clearStore();
  });

  test("creates the court with its parameters and zeroed counters", () => {
    handleCourtCreated(
      createCourtCreatedEvent(
        bi(2),
        bi(1),
        true,
        bi(200),
        bi(10000),
        bi(100),
        bi(511),
        times(10, 20, 30, 40),
        [bi(1), bi(3)],
        ELIGIBILITY
      )
    );

    assert.entityCount("Court", 1);
    assert.fieldEquals("Court", "2", "parent", "1");
    assert.fieldEquals("Court", "2", "hiddenVotes", "true");
    assert.fieldEquals("Court", "2", "minStake", "200");
    assert.fieldEquals("Court", "2", "alpha", "10000");
    assert.fieldEquals("Court", "2", "feeForJuror", "100");
    assert.fieldEquals("Court", "2", "jurorsForCourtJump", "511");
    assert.fieldEquals("Court", "2", "timesPerPeriod", "[10, 20, 30, 40]");
    assert.fieldEquals("Court", "2", "supportedDisputeKits", "[1, 3]");
    assert.fieldEquals("Court", "2", "eligibility", ELIGIBILITY.toHexString());
    assert.fieldEquals("Court", "2", "numberDisputes", "0");
    assert.fieldEquals("Court", "2", "stake", "0");
    assert.fieldEquals("Court", "2", "effectiveStake", "0");
    assert.fieldEquals("Court", "2", "paidETH", "0");
  });
});

describe("KlerosCore - handleCourtModified", () => {
  afterEach(() => {
    clearStore();
  });

  test("updates the mutable court parameters", () => {
    seedCourt(GENERAL_COURT);
    handleCourtModified(
      createCourtModifiedEvent(bi(1), true, bi(999), bi(5000), bi(77), bi(31), times(1, 2, 3, 4), ELIGIBILITY)
    );

    assert.fieldEquals("Court", GENERAL_COURT, "hiddenVotes", "true");
    assert.fieldEquals("Court", GENERAL_COURT, "minStake", "999");
    assert.fieldEquals("Court", GENERAL_COURT, "alpha", "5000");
    assert.fieldEquals("Court", GENERAL_COURT, "feeForJuror", "77");
    assert.fieldEquals("Court", GENERAL_COURT, "jurorsForCourtJump", "31");
    assert.fieldEquals("Court", GENERAL_COURT, "timesPerPeriod", "[1, 2, 3, 4]");
    assert.fieldEquals("Court", GENERAL_COURT, "eligibility", ELIGIBILITY.toHexString());
  });

  test("ignores an unknown court", () => {
    handleCourtModified(createCourtModifiedEvent(bi(9), true, bi(1), bi(1), bi(1), bi(1), times(1, 2, 3, 4)));

    assert.entityCount("Court", 0);
  });
});

describe("KlerosCore - handleDisputeKitCreated", () => {
  afterEach(() => {
    clearStore();
  });

  test("creates the dispute kit with its address", () => {
    handleDisputeKitCreated(createDisputeKitCreatedEvent(bi(1), DK_CLASSIC));

    assert.fieldEquals("DisputeKit", "1", "address", DK_CLASSIC.toHexString());
    assert.fieldEquals("DisputeKit", "1", "needsFreezing", "false");
  });
});

describe("KlerosCore - handleDisputeKitEnabled", () => {
  afterEach(() => {
    clearStore();
  });

  test("enabling appends the dispute kit to the court", () => {
    seedCourt(GENERAL_COURT, null, ["1"]);
    handleDisputeKitEnabled(createDisputeKitEnabledEvent(bi(1), bi(2), true));

    assert.fieldEquals("Court", GENERAL_COURT, "supportedDisputeKits", "[1, 2]");
  });

  test("ignores an unknown court", () => {
    handleDisputeKitEnabled(createDisputeKitEnabledEvent(bi(9), bi(2), true));

    assert.entityCount("Court", 0);
  });

  test(
    "KNOWN BUG: disabling a dispute kit removes it from the court",
    () => {
      seedCourt(GENERAL_COURT, null, ["1", "2", "3"]);
      handleDisputeKitEnabled(createDisputeKitEnabledEvent(bi(1), bi(2), false));

      assert.fieldEquals("Court", GENERAL_COURT, "supportedDisputeKits", "[1, 3]");
    },
    true
  );

  test(
    "KNOWN BUG: enabling an already supported dispute kit does not duplicate it",
    () => {
      seedCourt(GENERAL_COURT, null, ["1"]);
      handleDisputeKitEnabled(createDisputeKitEnabledEvent(bi(1), bi(1), true));

      assert.fieldEquals("Court", GENERAL_COURT, "supportedDisputeKits", "[1]");
    },
    true
  );

  test(
    "KNOWN BUG: filterSupportedDisputeKits drops the matching id",
    () => {
      const kept = filterSupportedDisputeKits(["1", "2", "3"], bi(2).toString());

      assert.i32Equals(2, kept.length);
    },
    true
  );
});

describe("KlerosCore - handleAcceptedFeeToken", () => {
  afterEach(() => {
    clearStore();
    dataSourceMock.resetValues();
  });

  test("creates the fee token, fetches its rate and marks it accepted", () => {
    mockRates(ERC20_TOKEN, bi(2500), 6);
    handleAcceptedFeeToken(createAcceptedFeeTokenEvent(ERC20_TOKEN, true));

    const id = ERC20_TOKEN.toHexString();
    assert.fieldEquals("FeeToken", id, "accepted", "true");
    assert.fieldEquals("FeeToken", id, "rateInEth", "2500");
    assert.fieldEquals("FeeToken", id, "rateDecimals", "6");
  });

  test("toggles acceptance off without losing totals", () => {
    mockRates(ERC20_TOKEN, bi(2500), 6);
    handleAcceptedFeeToken(createAcceptedFeeTokenEvent(ERC20_TOKEN, true));
    handleAcceptedFeeToken(createAcceptedFeeTokenEvent(ERC20_TOKEN, false));

    assert.entityCount("FeeToken", 1);
    assert.fieldEquals("FeeToken", ERC20_TOKEN.toHexString(), "accepted", "false");
  });
});

describe("KlerosCore - handleCourtJump", () => {
  afterEach(() => {
    clearStore();
  });

  test("moves the dispute to the destination court", () => {
    seedCourt(CHILD_COURT, GENERAL_COURT);
    seedDisputeInCourt("0");
    handleCourtJump(createCourtJumpEvent(bi(0), bi(1), bi(1), bi(2)));

    assert.fieldEquals("Dispute", "0", "court", CHILD_COURT);
  });

  test("ignores an unknown dispute", () => {
    handleCourtJump(createCourtJumpEvent(bi(5), bi(1), bi(1), bi(2)));

    assert.entityCount("Dispute", 0);
  });
});
