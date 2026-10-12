import { parseEther, type PublicClient } from "viem";
import { describe, it, expect, vi } from "vitest";

import { CoinIds } from "consts/coingecko";

import type { UserQuery } from "queries/useUser";

import { aShift, aUserQuery } from "src/test/builders";

import { getDrawnJurorsWithCount } from "./getDrawnJurorsWithCount";
import { calculateTotalJurorReward, getFormattedRewards } from "./jurorRewardConfig";
import { validateAddress } from "./validateAddressOrEns";

const ALICE = "0x00000000000000000000000000000000000a11ce";
const BOB = "0x0000000000000000000000000000000000000b0b";

const aDraw = (juror: string, justification?: { transactionHash: string; timestamp: string }) => ({
  juror: { id: juror },
  vote: {
    commited: false,
    justification: justification ? { ...justification, choice: "1", reference: "" } : null,
  },
});

describe("getDrawnJurorsWithCount", () => {
  it("collapses repeated draws of a juror into one entry with a vote count", () => {
    const result = getDrawnJurorsWithCount([
      aDraw(ALICE, { transactionHash: "0xaa", timestamp: "100" }),
      aDraw(BOB),
      aDraw(ALICE),
    ]);

    expect(result).toEqual([
      expect.objectContaining({ juror: { id: ALICE }, voteCount: 2, transactionHash: "0xaa", timestamp: "100" }),
      expect.objectContaining({ juror: { id: BOB }, voteCount: 1, transactionHash: undefined }),
    ]);
  });

  it("keeps the vote of the first draw for a juror", () => {
    const first = aDraw(ALICE, { transactionHash: "0x01", timestamp: "1" });
    const [entry] = getDrawnJurorsWithCount([first, aDraw(ALICE, { transactionHash: "0x02", timestamp: "2" })]);
    expect(entry.vote).toBe(first.vote);
  });
});

const userWithShifts = (shifts: { pnkAmount: string; ethAmount: string }[]) =>
  aUserQuery({ shifts: shifts.map((shift) => aShift(shift)) });

describe("juror rewards", () => {
  const data = userWithShifts([
    { pnkAmount: parseEther("100").toString(), ethAmount: parseEther("0.01").toString() },
    { pnkAmount: parseEther("-20").toString(), ethAmount: parseEther("0.02").toString() },
  ]);

  it("sums PNK (coin 0) and ETH (coin 1) shifts", () => {
    expect(calculateTotalJurorReward(0, data)).toBe(parseEther("80"));
    expect(calculateTotalJurorReward(1, data)).toBe(parseEther("0.03"));
  });

  it("is zero for a user with no record", () => {
    expect(calculateTotalJurorReward(0, { user: null } as UserQuery)).toBe(0n);
  });

  it("formats amounts and their USD value from coin prices", () => {
    const prices = { [CoinIds.ETH]: { price: 2000 }, [CoinIds.PNK]: { price: 0.02 } };
    expect(getFormattedRewards(data, prices)).toEqual([
      { token: "ETH", amount: "0.03", value: "60" },
      { token: "PNK", amount: "80", value: "1.6" },
    ]);
  });

  it("values rewards at zero while prices are loading", () => {
    expect(getFormattedRewards(data, undefined).map((r) => r.value)).toEqual(["0", "0"]);
  });

  it.fails("KNOWN BUG: totals lose wei precision because shifts are summed as JS numbers", () => {
    const precise = userWithShifts([
      { pnkAmount: "1000000000000000001", ethAmount: "0" },
      { pnkAmount: "1", ethAmount: "0" },
    ]);
    expect(calculateTotalJurorReward(0, precise)).toBe(1000000000000000002n);
  });
});

describe("validateAddress", () => {
  const clientResolving = (address: string | null) =>
    ({ getEnsAddress: vi.fn().mockResolvedValue(address) }) as unknown as PublicClient & {
      getEnsAddress: ReturnType<typeof vi.fn>;
    };

  it("accepts a hex address without an ENS lookup", async () => {
    const client = clientResolving(null);
    await expect(validateAddress(ALICE, client)).resolves.toBe(true);
    expect(client.getEnsAddress).not.toHaveBeenCalled();
  });

  it("accepts an ENS name that resolves, normalizing it first", async () => {
    const client = clientResolving(ALICE);
    await expect(validateAddress("Kleros.ETH", client)).resolves.toBe(true);
    expect(client.getEnsAddress).toHaveBeenCalledWith({ name: "kleros.eth" });
  });

  it("rejects an ENS name that does not resolve or a lookup that fails", async () => {
    await expect(validateAddress("nobody.eth", clientResolving(null))).resolves.toBe(false);
    const failing = { getEnsAddress: vi.fn().mockRejectedValue(new Error("rpc down")) } as unknown as PublicClient;
    await expect(validateAddress("kleros.eth", failing)).resolves.toBe(false);
  });
});
