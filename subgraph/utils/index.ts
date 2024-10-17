import { JSONValue, JSONValueKind } from "@graphprotocol/graph-ts";

export function JSONValueToMaybeString(value: JSONValue | null, _default: string = "-"): string {
  // Subgraph considers an empty string to be null and
  // the handler crashes when attempting to save the entity.
  // This is a security vulnerability because an adversary
  // could manually craft an item with missing columns
  // and the item would not show up in the UI, passing
  // the challenge period unoticed.
  //
  // We fix this by setting the field manually to a hifen.
  if (value == null || value.isNull()) {
    return "-";
  }

  switch (value.kind) {
    case JSONValueKind.BOOL:
      return value.toBool() == true ? "true" : "false";
    case JSONValueKind.STRING:
      return value.toString();
    case JSONValueKind.NUMBER:
      return value.toBigInt().toHexString();
    default:
      return _default;
  }
}
