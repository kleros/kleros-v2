import { decodeFunctionData } from "viem";
import { describe, expect, it } from "vitest";
import { EXAMPLE_ADDRESSES, EXAMPLE_CHAINS, exampleConfig, makeFakePorts } from "../testing";
import { HOME_GATEWAY_FUNDING_ABI } from "./abi/homeGateway";
import { WRAPPED_NATIVE_ABI } from "./abi/weth";
import { createGatewayAdapters, unwrapTx } from ".";

describe("HomeGateway funding adapter", () => {
  it("reads the gateway's native balance", async () => {
    const ports = makeFakePorts();
    ports.chains.get(EXAMPLE_CHAINS.home)!.setNativeBalance(EXAMPLE_ADDRESSES.homeGatewayUsdc, 42n * 10n ** 15n);
    const home = createGatewayAdapters(ports).homeGateways.get("usdc-home")!;
    expect(await home.availableNative()).toBe(42n * 10n ** 15n);
  });

  it("deposits native value through the configured deposit method", async () => {
    const ports = makeFakePorts();
    const home = createGatewayAdapters(ports).homeGateways.get("eth-home")!;
    const tx = await home.depositTx(10n ** 17n);
    expect(tx).toMatchObject({ chainId: EXAMPLE_CHAINS.home, to: EXAMPLE_ADDRESSES.homeGatewayEth, value: 10n ** 17n });
    expect(decodeFunctionData({ abi: HOME_GATEWAY_FUNDING_ABI, data: tx.data! }).functionName).toBe("depositNative");
    await expect(home.depositTx(0n)).rejects.toThrow();

    const transferPorts = makeFakePorts(
      exampleConfig({ refill: { pairs: { "eth-home": { depositMethod: "nativeTransfer" } } } })
    );
    const plain = await createGatewayAdapters(transferPorts).homeGateways.get("eth-home")!.depositTx(5n);
    expect(plain).toEqual({ chainId: EXAMPLE_CHAINS.home, to: EXAMPLE_ADDRESSES.homeGatewayEth, value: 5n });
    const other = await createGatewayAdapters(transferPorts).homeGateways.get("usdc-home")!.depositTx(5n);
    expect(other.data).toBeDefined();
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
