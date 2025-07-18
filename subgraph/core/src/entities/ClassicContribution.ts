import { ClassicContribution, Dispute, DisputeKit, Round } from "../../generated/schema";
import { Contribution as ContributionEvent, Withdrawal } from "../../generated/DisputeKitClassic/DisputeKitClassic";
import { ensureUser } from "./User";

export function ensureClassicContributionFromEvent<T>(event: T): ClassicContribution | null {
  if (!(event instanceof ContributionEvent) && !(event instanceof Withdrawal)) return null;
  const coreDisputeID = event.params._coreDisputeID.toString();
  const coreRoundIndex = event.params._coreRoundID.toString();

  const coreDispute = Dispute.load(coreDisputeID);
  if (!coreDispute) return null;

  const roundId = `${coreDisputeID}-${coreRoundIndex}`;
  const coreRound = Round.load(roundId);
  if (!coreRound) return null;

  const disputeKitID = coreRound.disputeKit;

  const roundID = `${disputeKitID}-${coreDisputeID}-${coreRoundIndex}`;

  ensureUser(event.params._contributor.toHexString());
  const contributor = event.params._contributor.toHexString();
  const choice = event.params._choice;

  const id = `${roundID}-${contributor}-${choice}`;
  let classicContribution = ClassicContribution.load(id);

  if (!classicContribution) {
    classicContribution = new ClassicContribution(id);
    classicContribution.contributor = event.params._contributor.toHexString();
    classicContribution.coreDispute = coreDisputeID;
    classicContribution.localRound = roundID;
    classicContribution.amount = event.params._amount;
    classicContribution.choice = event.params._choice;
    classicContribution.rewardWithdrawn = false;
  } else {
    const currentAmount = classicContribution.amount;
    // we dont want to increase amount on withdraw event, the amount in that event is reward/reimburse amount
    if (event instanceof ContributionEvent) {
      classicContribution.amount = currentAmount.plus(event.params._amount);
    }
  }
  classicContribution.save();
  return classicContribution;
}
