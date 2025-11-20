import { assert, test, describe, clearStore, beforeEach } from "matchstick-as/assembly/index";
import { BigInt, Address } from "@graphprotocol/graph-ts";
import { createOffsetEvent, createUser } from "./leaderboard-offset-utils";
import { handleLeaderboardOffset } from "../src/LeaderboardOffset";

const address = Address.fromString("0x0000000000000000000000000000000000000001");

describe("Handle leaderboard offset", () => {
  beforeEach(() => {
    clearStore();
  });

  test("Should add a positive offset to the user's leaderboard score", () => {
    const user = createUser(address);
    const event = createOffsetEvent(address, BigInt.fromI32(100));
    handleLeaderboardOffset(event);
    assert.fieldEquals("User", user.id, "leaderboardOffset", "100");
  });

  test("Should add a negative offset to the user's leaderboard score", () => {
    const user = createUser(address);
    const event = createOffsetEvent(address, BigInt.fromI32(-100));
    handleLeaderboardOffset(event);
    assert.fieldEquals("User", user.id, "leaderboardOffset", "-100");
  });
});
