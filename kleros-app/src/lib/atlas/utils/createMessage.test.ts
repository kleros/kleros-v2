import { afterEach, describe, expect, it, vi } from "vitest";
import { parseSiweMessage, validateSiweMessage } from "viem/siwe";
import { ALICE } from "../../../test/atlas";
import { createMessage } from ".";

const NOW = new Date("2026-01-01T00:00:00.000Z");

describe("createMessage", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("builds a SIWE message bound to the current origin that expires in 10 minutes", () => {
    vi.useFakeTimers({ now: NOW, toFake: ["Date"] });

    const message = parseSiweMessage(createMessage(ALICE, "nonce123", 421614));

    expect(message).toMatchObject({
      domain: window.location.host,
      address: ALICE,
      statement: "Sign In to Kleros with Ethereum.",
      uri: window.location.origin,
      version: "1",
      chainId: 421614,
      nonce: "nonce123",
      expirationTime: new Date(NOW.getTime() + 10 * 60 * 1000),
    });
  });

  it("uses a custom statement when given", () => {
    expect(parseSiweMessage(createMessage(ALICE, "nonce123", 1, "Log in to Curate")).statement).toBe(
      "Log in to Curate"
    );
  });

  it("is no longer valid after 10 minutes", () => {
    vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
    const message = parseSiweMessage(createMessage(ALICE, "nonce123", 1));

    expect(validateSiweMessage({ message, time: new Date(NOW.getTime() + 9 * 60 * 1000) })).toBe(true);
    expect(validateSiweMessage({ message, time: new Date(NOW.getTime() + 11 * 60 * 1000) })).toBe(false);
  });
});
