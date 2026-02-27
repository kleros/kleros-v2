import { newMockEvent } from "matchstick-as";
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts";
import { NewCurrencyRate } from "../generated/RatesConverter/RatesConverter";

export function createNewCurrencyRateEvent(feeToken: Address, rateInEth: BigInt, rateDecimals: i32): NewCurrencyRate {
  let event = changetype<NewCurrencyRate>(newMockEvent());

  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("_feeToken", ethereum.Value.fromAddress(feeToken)));
  event.parameters.push(new ethereum.EventParam("_rateInEth", ethereum.Value.fromUnsignedBigInt(rateInEth)));
  event.parameters.push(new ethereum.EventParam("_rateDecimals", ethereum.Value.fromI32(rateDecimals)));

  return event;
}
