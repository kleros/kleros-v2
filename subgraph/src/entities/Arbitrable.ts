import { BigInt } from "@graphprotocol/graph-ts";
import { Arbitrable } from "../../generated/schema";
import { ZERO } from "../utils";

export function ensureArbitrable(id: string): Arbitrable {
  let arbitrable = Arbitrable.load(id);

  if (arbitrable) return arbitrable;

  arbitrable = new Arbitrable(id);
  arbitrable.totalDisputes = ZERO;

  return arbitrable;
}

export function updateArbitrableCases(id: string, delta: BigInt): void {
  const arbitrable = ensureArbitrable(id);
  arbitrable.totalDisputes = arbitrable.totalDisputes.plus(delta);
  arbitrable.save();
}
