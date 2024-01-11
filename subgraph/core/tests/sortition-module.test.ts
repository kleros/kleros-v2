import { assert, describe, test, clearStore, beforeAll, afterAll } from "matchstick-as/assembly/index";
import { BigInt, Address } from "@graphprotocol/graph-ts";
import { handleStakeSet } from "../src/SortitionModule";
import { createStakeSetEvent } from "./sortition-module-utils";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe event", () => {
  beforeAll(() => {
    let courtId = BigInt.fromI32(1);
    let amount = BigInt.fromI32(1000);
    let jurorAddress = Address.fromString("0x922911F4f80a569a4425fa083456239838F7F003");
    let newStakeSetEvent = createStakeSetEvent(jurorAddress, courtId, amount);
    handleStakeSet(newStakeSetEvent);
  });

  afterAll(() => {
    clearStore();
  });

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("Initialized created and stored", () => {
    assert.entityCount("Initialized", 1);

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    // assert.fieldEquals(
    //   "Initialized",
    //   "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
    //   "version",
    //   "234"
    // )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  });
});
