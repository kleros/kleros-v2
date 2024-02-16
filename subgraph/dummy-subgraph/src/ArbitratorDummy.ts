import { ArbitrableRegisteration as ArbitrableRegistrationEvent } from "../generated/ArbitratorDummy/ArbitratorDummy";
import { Arbitrable as ArbitrableTemplate } from "../generated/templates";
import { Arbitrable } from "../generated/schema";

export function handleArbitrableRegistration(event: ArbitrableRegistrationEvent): void {
  const arbitrableAddress = event.params._arbitrable;
  ArbitrableTemplate.create(arbitrableAddress);
  const arbitrable = new Arbitrable(arbitrableAddress);
  arbitrable.registrationDate = event.block.timestamp;
  arbitrable.save();
}
