import { store, ValueKind } from "@graphprotocol/graph-ts";
import { assert } from "matchstick-as/assembly/index";

/** Works for every field type; assert.assertNull<BigInt> crashes the AssemblyScript compiler. */
export function assertFieldUnset(entityType: string, id: string, field: string): void {
  const entity = store.get(entityType, id);
  assert.assertNotNull(entity, `${entityType} ${id} not in store`);
  const value = entity!.get(field);
  assert.assertTrue(value == null || value.kind == ValueKind.NULL, `expected ${entityType} ${id}.${field} to be null`);
}
