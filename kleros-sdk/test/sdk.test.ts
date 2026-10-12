import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SdkConfig } from "../src/types";
import { createMockTransport } from "./helpers/rpc";

// sdk.ts keeps the public client as module state, so each test imports a fresh copy.
const loadSdk = async () => {
  const sdk = await import("../src/sdk.js");
  const errors = await import("../src/errors/index.js");
  const { callAction } = await import("../src/dataMappings/actions/callAction.js");
  const { eventAction } = await import("../src/dataMappings/actions/eventAction.js");
  return { ...sdk, ...errors, callAction, eventAction };
};

describe("sdk configuration", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("throws SdkNotConfiguredError before configureSDK is called", async () => {
    const { getPublicClient, SdkNotConfiguredError } = await loadSdk();

    expect(() => getPublicClient()).toThrow(SdkNotConfiguredError);
  });

  it.each(["callAction", "eventAction"] as const)("%s rejects before configureSDK is called", async (name) => {
    const sdk = await loadSdk();
    const action = sdk[name] as (mapping: unknown) => Promise<unknown>;

    await expect(action({ abi: "event E()", eventFilter: {} })).rejects.toThrow(sdk.SdkNotConfiguredError);
  });

  it("returns a public client after configureSDK", async () => {
    const { configureSDK, getPublicClient } = await loadSdk();

    configureSDK(createMockTransport().sdkConfig);

    expect(getPublicClient()?.chain?.id).toBe(421614);
  });

  it("keeps the previous client when configureSDK gets no client", async () => {
    const { configureSDK, getPublicClient } = await loadSdk();
    configureSDK(createMockTransport().sdkConfig);
    const before = getPublicClient();

    configureSDK({} as SdkConfig);

    expect(getPublicClient()).toBe(before);
  });
});
