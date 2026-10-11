import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";

function word(value: i32): Bytes {
  return ethereum.encode(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(value)))!;
}

/** KlerosCore arbitrator extraData: abi.encode(courtID, minJurors, disputeKitID). */
export function extraData(courtID: i32, minJurors: i32, disputeKitID: i32): Bytes {
  return word(courtID).concat(word(minJurors)).concat(word(disputeKitID));
}
