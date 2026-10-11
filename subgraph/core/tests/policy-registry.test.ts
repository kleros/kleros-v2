import { afterEach, assert, clearStore, describe, test } from "matchstick-as/assembly/index";
import { handlePolicyUpdate } from "../src/PolicyRegistry";
import { createPolicyUpdateEvent } from "./utils/events";
import { seedCourt } from "./utils/entities";
import { bi, GENERAL_COURT } from "./utils/constants";

describe("PolicyRegistry - handlePolicyUpdate", () => {
  afterEach(() => {
    clearStore();
  });

  test("sets the court's name and policy", () => {
    seedCourt(GENERAL_COURT);
    handlePolicyUpdate(createPolicyUpdateEvent(bi(1), "General Court", "/ipfs/QmPolicy"));

    assert.fieldEquals("Court", GENERAL_COURT, "name", "General Court");
    assert.fieldEquals("Court", GENERAL_COURT, "policy", "/ipfs/QmPolicy");
  });

  test("overwrites a previous policy", () => {
    seedCourt(GENERAL_COURT);
    handlePolicyUpdate(createPolicyUpdateEvent(bi(1), "General Court", "/ipfs/QmOld"));
    handlePolicyUpdate(createPolicyUpdateEvent(bi(1), "General", "/ipfs/QmNew"));

    assert.fieldEquals("Court", GENERAL_COURT, "name", "General");
    assert.fieldEquals("Court", GENERAL_COURT, "policy", "/ipfs/QmNew");
  });

  test("does not create a court for an unknown id", () => {
    handlePolicyUpdate(createPolicyUpdateEvent(bi(7), "Ghost", "/ipfs/Qm"));

    assert.entityCount("Court", 0);
  });
});
