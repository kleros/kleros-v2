import { log } from "@graphprotocol/graph-ts";
import { Offset } from "../generated/LeaderboardOffset/LeaderboardOffset";
import { User } from "../generated/schema";
import { computeCoherenceScore } from "./entities/User";

export function handleLeaderboardOffset(event: Offset): void {
  const user = User.load(event.params.user.toHexString());
  if (!user) {
    log.error(`User {} not found.`, [event.params.user.toHexString()]);
    return;
  }
  //keep track of offset separately
  user.leaderboardOffset = user.leaderboardOffset.plus(event.params.offset);

  //apply the offset and re compute coherenceScore
  user.totalCoherentVotes = user.totalCoherentVotes.plus(event.params.offset);
  // Recalculate coherenceScore
  user.coherenceScore = computeCoherenceScore(user.totalCoherentVotes, user.totalResolvedVotes);

  user.save();
}
