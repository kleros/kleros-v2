import { describe, expect, it } from "vitest";
import type { ReporterRoute } from "../config/schema";
import { EXAMPLE_ADDRESSES, EXAMPLE_CHAINS, FAKE_SIGNER, makeFakePorts } from "../testing";
import { NativeTransferReporterFunding, PreflightUnavailable, feeTokenDispatch, isRevert } from "./adapter";

/** `PUSH4 feeToken()` as in a Solidity dispatcher, then a Solidity CBOR metadata trailer. */
const FEE_TOKEN_DISPATCHER = "0x63647846a5146100" as const;
const METADATA = `a26469706673582212${"20"}${"f4".repeat(32)}64736f6c63430008140033`;
/** An EIP-1167 minimal proxy: it DELEGATECALLs every call to its implementation. */
const MINIMAL_PROXY = `0x363d3d373d3d3d363d73${"bb".repeat(20)}5af43d82803e903d91602b57fd5bf3` as const;

/** The platform `ChainClient`'s message for a reverting `feeToken()` read of a contract without the function. */
const FEE_TOKEN_REVERT = 'The contract function "feeToken" reverted. revertData=none';

function setup() {
  const ports = makeFakePorts();
  const funding = new NativeTransferReporterFunding(ports.config.topology, ports.chains, ports.signer);
  const route = ports.config.topology.routes.find((r) => r.id === "eth-home->home")!;
  const chain = ports.chains.get(EXAMPLE_CHAINS.foreignEth)!;
  return { ports, funding, route, chain };
}

/** A LayerZero or DeBridge reporter: no `feeToken()`, so the read reverts. */
function revertFeeToken(chain: ReturnType<typeof setup>["chain"]) {
  chain.onRead(
    (call) => call.functionName === "feeToken",
    () => {
      throw new Error(FEE_TOKEN_REVERT);
    }
  );
}

describe("NativeTransferReporterFunding", () => {
  it("reads the reporter's native balance on its chain", async () => {
    const { funding, route, chain, ports } = setup();
    chain.setNativeBalance(EXAMPLE_ADDRESSES.reporterEthToHome, 123n);
    ports.chains.get(EXAMPLE_CHAINS.home)!.setNativeBalance(EXAMPLE_ADDRESSES.reporterEthToHome, 999n);
    expect(await funding.balance(route)).toBe(123n);
  });

  it("passes the preflight for a known route with code whose transfer simulates", async () => {
    const { funding, route, chain } = setup();
    chain.setCode(route.reporter);
    revertFeeToken(chain);
    const simulated: Array<{ to: string; value: bigint; data?: string; from: string }> = [];
    chain.estimate = (request, from) => {
      simulated.push({ ...request, from });
      return 30_000n;
    };
    expect(await funding.preflight(route)).toEqual({ ok: true, reasons: [] });
    expect(simulated).toEqual([{ chainId: route.chainId, to: route.reporter, value: 1n, from: FAKE_SIGNER }]);
  });

  it("fails the preflight for an address without code", async () => {
    const { funding, route } = setup();
    const result = await funding.preflight(route);
    expect(result.ok).toBe(false);
    expect(result.reasons).toEqual([`no code at reporter ${route.reporter}`]);
  });

  it("fails the preflight when estimateGas of the transfer throws", async () => {
    const { funding, route, chain } = setup();
    chain.setCode(route.reporter);
    revertFeeToken(chain);
    chain.estimate = () => {
      throw new Error("execution reverted revertData=none");
    };
    const result = await funding.preflight(route);
    expect(result.ok).toBe(false);
    expect(result.reasons).toEqual([
      "native transfer to the reporter does not simulate: execution reverted revertData=none",
    ]);
  });

  it("fails the preflight for a route absent from the topology, listing every reason", async () => {
    const { funding, route, chain } = setup();
    chain.estimate = () => {
      throw new Error("Execution reverted. revertData=none");
    };
    const unknown: ReporterRoute = { ...route, reporter: "0x00000000000000000000000000000000000000ee" };
    const result = await funding.preflight(unknown);
    expect(result.ok).toBe(false);
    expect(result.reasons).toEqual([
      `route ${route.id} is not in the configured topology (reporter ${unknown.reporter})`,
      `no code at reporter ${unknown.reporter}`,
      "native transfer to the reporter does not simulate: Execution reverted. revertData=none",
    ]);
    const renamed = await funding.preflight({ ...route, id: "elsewhere->home" });
    expect(renamed.reasons[0]).toBe(
      `route elsewhere->home is not in the configured topology (reporter ${route.reporter})`
    );
  });

  it("refuses a CCIP reporter that pays its fees in an ERC20 feeToken; native-fee CCIP passes", async () => {
    const { funding, route, chain } = setup();
    chain.setCode(route.reporter);
    const feeToken = "0x00000000000000000000000000000000000000fe";
    let token: string = feeToken;
    chain.onRead(
      (call) => call.functionName === "feeToken" && call.address === route.reporter,
      () => token
    );
    const refused = await funding.preflight(route);
    expect(refused.ok).toBe(false);
    expect(refused.reasons).toEqual([
      `reporter ${route.reporter} pays its fees in the ERC20 feeToken ${feeToken}; ` +
        `only reporters paying native fees are supported`,
    ]);
    token = "0x0000000000000000000000000000000000000000";
    expect(await funding.preflight(route)).toEqual({ ok: true, reasons: [] });
  });

  it("never passes the preflight on a failed feeToken() read: a failing client defers, never suspends", async () => {
    const { funding, route, chain } = setup();
    chain.setCode(route.reporter, FEE_TOKEN_DISPATCHER);
    chain.onRead(
      (call) => call.functionName === "feeToken",
      () => {
        throw new Error("HTTP request failed.");
      }
    );
    await expect(funding.preflight(route)).rejects.toBeInstanceOf(PreflightUnavailable);
    await expect(funding.preflight(route)).rejects.toThrow(
      /feeToken\(\) of reporter .* could not be read: HTTP request failed/
    );

    // A proxy (DELEGATECALL in its code) may forward feeToken(): a failed read is unreadable too.
    chain.setCode(route.reporter, MINIMAL_PROXY);
    await expect(funding.preflight(route)).rejects.toBeInstanceOf(PreflightUnavailable);

    // A client whose every read fails: the code lookup itself is unavailable.
    chain.getCode = async () => {
      throw new Error("The request took too long to respond.");
    };
    await expect(funding.preflight(route)).rejects.toThrow(/code lookup failed/);

    // A read that answers something other than an address is not native either.
    const other = setup();
    other.chain.setCode(other.route.reporter, FEE_TOKEN_DISPATCHER);
    other.chain.onRead((call) => call.functionName === "feeToken", "0x");
    await expect(other.funding.preflight(other.route)).rejects.toBeInstanceOf(PreflightUnavailable);
  });

  it("treats the revert of a reporter whose code cannot dispatch feeToken() as native fees", async () => {
    const { funding, route, chain } = setup();
    // No feeToken() selector and no DELEGATECALL outside the metadata trailer (whose f4 bytes are skipped).
    chain.setCode(route.reporter, `0x6080604052${METADATA}`);
    chain.onRead(
      (call) => call.functionName === "feeToken",
      () => {
        throw new Error("execution reverted revertData=none");
      }
    );
    expect(await funding.preflight(route)).toEqual({ ok: true, reasons: [] });
    expect(feeTokenDispatch(`0x6080604052${METADATA}`)).toBe("absent");
    expect(feeTokenDispatch(`${FEE_TOKEN_DISPATCHER}${METADATA}`)).toBe("selector");
    expect(feeTokenDispatch("0x6080f4")).toBe("delegates");
    expect(feeTokenDispatch(MINIMAL_PROXY)).toBe("delegates");
    // The selector bytes as the operand of a wider push are data, not a dispatcher entry.
    expect(feeTokenDispatch("0x64647846a51400")).toBe("absent");
  });

  it("follow-up 007: native fees only when the read reverts and the code has no feeToken() selector", async () => {
    // Revert plus absent selector: native, the preflight passes.
    const reverting = setup();
    reverting.chain.setCode(reverting.route.reporter, `0x6080604052${METADATA}`);
    revertFeeToken(reverting.chain);
    expect(await reverting.funding.preflight(reverting.route)).toEqual({ ok: true, reasons: [] });

    // The same bytecode, the read failing on transport (or with an unknown error): a deferral, never a pass.
    for (const message of [
      "HTTP request failed.",
      "The request took too long to respond.",
      "FakeChainClient(8453): no read scripted for feeToken",
      // The word without the platform's marker is not a revert (decisions [L42]).
      'The contract function "feeToken" reverted.',
      "execution reverted",
    ]) {
      const failing = setup();
      failing.chain.setCode(failing.route.reporter, `0x6080604052${METADATA}`);
      failing.chain.onRead(
        (call) => call.functionName === "feeToken",
        () => {
          throw new Error(message);
        }
      );
      let simulated = false;
      failing.chain.estimate = () => {
        simulated = true;
        return 21_000n;
      };
      const error = await failing.funding.preflight(failing.route).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(PreflightUnavailable);
      expect((error as Error).message).toContain(`feeToken() of reporter ${failing.route.reporter} could not be read`);
      expect(simulated).toBe(false);
    }

    // A non-zero token is a refusal, whatever the bytecode.
    const erc20 = setup();
    erc20.chain.setCode(erc20.route.reporter, `0x6080604052${METADATA}`);
    erc20.chain.onRead((call) => call.functionName === "feeToken", "0x00000000000000000000000000000000000000fe");
    const refused = await erc20.funding.preflight(erc20.route);
    expect(refused.ok).toBe(false);
    expect(refused.reasons[0]).toMatch(/pays its fees in the ERC20 feeToken 0x0+fe/);
  });

  it("follow-up 007: an estimateGas transport failure defers; only a revert refuses the transfer", async () => {
    const { funding, route, chain } = setup();
    chain.setCode(route.reporter);
    revertFeeToken(chain);
    chain.estimate = () => {
      throw new Error("HTTP request failed.");
    };
    const error = await funding.preflight(route).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(PreflightUnavailable);
    expect((error as Error).message).toMatch(/transfer simulation failed: HTTP request failed/);

    for (const message of ["Execution reverted for an unknown reason.", "reverted"]) {
      chain.estimate = () => {
        throw new Error(message);
      };
      await expect(funding.preflight(route)).rejects.toBeInstanceOf(PreflightUnavailable);
    }

    for (const revert of [
      "Execution reverted for an unknown reason. revertData=none",
      "execution reverted revertData=0x08c379a0",
    ]) {
      chain.estimate = () => {
        throw new Error(revert);
      };
      expect(await funding.preflight(route)).toEqual({
        ok: false,
        reasons: [`native transfer to the reporter does not simulate: ${revert}`],
      });
    }
  });

  it("follow-up 008: tells a revert from a transport error by the revertData= suffix marker only", () => {
    expect(isRevert(new Error(FEE_TOKEN_REVERT))).toBe(true);
    expect(isRevert(new Error("call failed revertData=0x1234"))).toBe(true);
    expect(isRevert(new Error("Execution reverted. revertData=0x"))).toBe(true);
    expect(isRevert(new Error("revertData=none"))).toBe(true);
    // The word "reverted" without the marker is never a revert.
    expect(isRevert(new Error('The contract function "feeToken" reverted.'))).toBe(false);
    expect(isRevert(new Error("Execution reverted with reason: no receive."))).toBe(false);
    // The marker must be the suffix, whole: not mid-message, not glued to another word, not malformed.
    expect(isRevert(new Error("revertData=none then HTTP request failed."))).toBe(false);
    expect(isRevert(new Error("xrevertData=none"))).toBe(false);
    expect(isRevert(new Error("call failed revertData=0xzz"))).toBe(false);
    expect(isRevert(new Error("HTTP request failed."))).toBe(false);
    expect(isRevert(new Error("The request took too long to respond."))).toBe(false);
    expect(isRevert(new Error('The contract function "feeToken" returned no data ("0x").'))).toBe(false);
    expect(isRevert("socket hang up")).toBe(false);
  });

  it("builds a native-value transaction to the reporter with no calldata", async () => {
    const { funding, route } = setup();
    const tx = await funding.fundingTx(route, 5n * 10n ** 16n);
    expect(tx).toEqual({ chainId: EXAMPLE_CHAINS.foreignEth, to: route.reporter, value: 5n * 10n ** 16n });
    expect(tx.data).toBeUndefined();
    await expect(funding.fundingTx(route, 0n)).rejects.toThrow(/positive/);
  });
});
