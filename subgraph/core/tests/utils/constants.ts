import { Address, BigInt } from "@graphprotocol/graph-ts";

// newMockEvent() emits from this address, so KlerosCore.bind(event.address) resolves to it.
export const CORE = Address.fromString("0xa16081f360e3847006db660bae1c6d1b2e17ec2a");
export const SORTITION = Address.fromString("0x5050505050505050505050505050505050505050");
export const RATES_CONVERTER = Address.fromString("0x7070707070707070707070707070707070707070");
export const DK_CLASSIC = Address.fromString("0xd1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1");
export const DK_OTHER = Address.fromString("0xd2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2");

export const ARBITRABLE = Address.fromString("0xabababababababababababababababababababab");
export const JUROR_A = Address.fromString("0x00000000000000000000000000000000000000a1");
export const JUROR_B = Address.fromString("0x00000000000000000000000000000000000000b2");
export const JUROR_C = Address.fromString("0x00000000000000000000000000000000000000c3");
export const CROWDFUNDER = Address.fromString("0x00000000000000000000000000000000000000cf");
export const ERC20_TOKEN = Address.fromString("0xe2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2");
export const NATIVE = Address.zero();

export const GENERAL_COURT = "1";
export const CHILD_COURT = "2";

// 2024-01-01T00:00:00Z and the following day; day ids are timestamp / 86400 * 86400.
export const DAY_1: i64 = 1704067200;
export const DAY_2: i64 = DAY_1 + 86400;

export function bi(value: i32): BigInt {
  return BigInt.fromI32(value);
}
