import { BigInt, Entity, store, log } from "@graphprotocol/graph-ts";

export const ZERO = BigInt.fromI32(0);
export const ONE = BigInt.fromI32(1);

export function loadWithLogs(entityName: string, id: string): Entity | null {
  const entity = store.get(entityName, id);

  if (!entity) {
    log.error("{} not found with id: {}", [entityName, id]);
    return null;
  }

  return entity;
}
