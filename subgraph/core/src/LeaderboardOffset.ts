import { log } from "@graphprotocol/graph-ts";
import { Offset } from "../generated/LeaderboardOffset/LeaderboardOffset";
import { User } from "../generated/schema";

export function handleLeaderboardOffset(event: Offset): void {
  const user = User.load(event.params.user.toHexString());
  if (!user) {
    log.error(`User {} not found.`, [event.params.user.toHexString()]);
    return;
  }
  user.leaderboardOffset = user.leaderboardOffset.plus(event.params.offset);
  user.save();
}
