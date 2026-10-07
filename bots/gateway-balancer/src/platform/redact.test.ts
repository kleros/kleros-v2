import { describe, expect, it } from "vitest";
import { Redactor } from "./redact";

const KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
const BARE_KEY = KEY.slice(2);
const RPC = "https://arb-mainnet.example.io/v2/ArbKeyMixedCase0001";
const WEBHOOK = "https://hooks.slack.com/services/T0/B0/WebhookSecret0004";
const API_KEY = "CG-ApiKeyMixedCase0005";
const HEX_TOKEN = "0xABCDEF0123456789abcdef0123456789";

describe("Redactor (L45)", () => {
  const redact = new Redactor([KEY, RPC, WEBHOOK, API_KEY, HEX_TOKEN]).text;

  it("removes every secret whatever its case", () => {
    for (const secret of [KEY, RPC, WEBHOOK, API_KEY, HEX_TOKEN]) {
      for (const variant of [secret, secret.toUpperCase(), secret.toLowerCase()]) {
        const out = redact(`failed with ${variant} in the message`);
        expect(out.toLowerCase(), variant).not.toContain(secret.toLowerCase());
        expect(out, variant).toContain("[redacted");
      }
    }
    // A key printed with a checksum-like mixed case.
    const mixed = KEY.replace(/[a-f]/g, (c, i: number) => (i % 2 ? c.toUpperCase() : c));
    expect(redact(`key=${mixed}`)).toBe("key=[redacted]");
  });

  it("removes a hex secret in its bare form, without 0x, in any case", () => {
    for (const variant of [BARE_KEY, BARE_KEY.toUpperCase(), `0X${BARE_KEY.toUpperCase()}`]) {
      const out = redact(`signer material ${variant}.`);
      expect(out.toLowerCase(), variant).not.toContain(BARE_KEY);
    }
    const bareToken = HEX_TOKEN.slice(2);
    expect(redact(`token ${bareToken.toLowerCase()} and ${bareToken.toUpperCase()}`).toLowerCase()).not.toContain(
      bareToken.toLowerCase()
    );
  });

  it("finds a secret configured without 0x when it is printed with it", () => {
    const fromBare = new Redactor([BARE_KEY]).text;
    expect(fromBare(`0x${BARE_KEY.toUpperCase()}`).toLowerCase()).not.toContain(BARE_KEY);
  });

  it("removes a URL's host and path even when the library normalized or re-cased it", () => {
    const out = redact(`request to ${RPC.toUpperCase().replace("HTTPS://", "https://")}/ failed`);
    expect(out.toLowerCase()).not.toContain("arbkeymixedcase0001");
    expect(out.toLowerCase()).not.toContain("arb-mainnet.example.io");
  });

  it("leaves text without secrets unchanged", () => {
    expect(redact("nonce 7 consumed revertData=0xdeadbeef")).toBe("nonce 7 consumed revertData=0xdeadbeef");
  });
});
