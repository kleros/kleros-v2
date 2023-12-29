import { ClassicContribution } from "../../generated/schema";
import { Contribution as ContributionEvent, Withdrawal } from "../../generated/DisputeKitClassic/DisputeKitClassic";
import { DISPUTEKIT_ID } from "../DisputeKitClassic";

export function ensureClassicContributionFromEvent<T>(event: T): ClassicContribution | null {
  if (!(event instanceof ContributionEvent) && !(event instanceof Withdrawal)) {
    return null;
  }
  const coreDisputeID = event.params._coreDisputeID.toString();
  const coreRoundIndex = event.params._coreRoundID.toString();
  const roundID = `${DISPUTEKIT_ID}-${coreDisputeID}-${coreRoundIndex}`;
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
    classicContribution.amount = currentAmount.plus(event.params._amount);
  }

  classicContribution.save();
  return classicContribution;
}
