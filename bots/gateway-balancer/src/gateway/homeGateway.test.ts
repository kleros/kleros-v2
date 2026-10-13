import { decodeFunctionData } from "viem";
import { describe, expect, it } from "vitest";
import { EXAMPLE_ADDRESSES, EXAMPLE_CHAINS, exampleConfig, makeFakePorts } from "../testing";
import { WRAPPED_NATIVE_ABI } from "./abi/weth";
import { createGatewayAdapters, unwrapTx } from ".";

describe("HomeGateway funding adapter", () => {
  it("reads the gateway's native balance", async () => {
    const ports = makeFakePorts();
    ports.chains.get(EXAMPLE_CHAINS.home)!.setNativeBalance(EXAMPLE_ADDRESSES.homeGatewayUsdc, 42n * 10n ** 15n);
    const home = createGatewayAdapters(ports).homeGateways.get("usdc-home")!;
    expect(await home.availableNative()).toBe(42n * 10n ** 15n);
  });

  it("deposits as a plain value transfer with no calldata", async () => {
    const ports = makeFakePorts();
    const adapters = createGatewayAdapters(ports).homeGateways;
    const tx = await adapters.get("eth-home")!.depositTx(10n ** 17n);
    expect(tx).toEqual({ chainId: EXAMPLE_CHAINS.home, to: EXAMPLE_ADDRESSES.homeGatewayEth, value: 10n ** 17n });
    expect(tx.data).toBeUndefined();
    expect((await adapters.get("usdc-home")!.depositTx(5n)).data).toBeUndefined();
    await expect(adapters.get("eth-home")!.depositTx(0n)).rejects.toThrow(/positive/);
  });

  it("unwraps WETH with withdraw(amount) on the chain's wrappedNative", () => {
    const config = exampleConfig();
    const home = config.topology.chains.find((c) => c.id === EXAMPLE_CHAINS.home)!;
    const tx = unwrapTx(home.id, home.wrappedNative!, 7n * 10n ** 16n);
    expect(tx).toMatchObject({ chainId: EXAMPLE_CHAINS.home, to: EXAMPLE_ADDRESSES.wethOnHome, value: 0n });
    const decoded = decodeFunctionData({ abi: WRAPPED_NATIVE_ABI, data: tx.data! });
    expect(decoded).toEqual({ functionName: "withdraw", args: [7n * 10n ** 16n] });
  });
});
