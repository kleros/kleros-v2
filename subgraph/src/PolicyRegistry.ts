import { PolicyUpdate } from "../generated/PolicyRegistry/PolicyRegistry";
import { Court } from "../generated/schema";

export function handlePolicyUpdate(event: PolicyUpdate): void {
  const courtID = event.params._subcourtID.toString();
  const court = Court.load(courtID);
  if (court) {
    court.policy = event.params._policy;
    court.save();
  }
}
