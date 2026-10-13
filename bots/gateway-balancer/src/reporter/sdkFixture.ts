/**
 * Tests only: the frozen `fixtures/veashi-sdk-0.1.0.json`, ABI and bytecode of the `@kleros/veashi-sdk@0.1.0`
 * reporters compiled from the SDK's own sources (the package ships no bytecode). Never imported by runtime code: the
 * Docker image carries no `fixtures` directory.
 */
import { readFileSync } from "node:fs";
import type { Abi } from "viem";
import type { Hex } from "../domain";

export type SdkContractName = "CCIPReporter" | "LayerZeroReporter" | "AxelarReporter" | "Yaho";

export interface SdkContract {
  source: string;
  constructor: string[];
  abi: Abi;
  bytecode: Hex;
  deployedBytecode: Hex;
}

export const SDK_FIXTURE_PATH = new URL("../../fixtures/veashi-sdk-0.1.0.json", import.meta.url);

export function sdkContract(name: SdkContractName): SdkContract {
  const fixture = JSON.parse(readFileSync(SDK_FIXTURE_PATH, "utf8")) as { contracts: Record<string, SdkContract> };
  const contract = fixture.contracts[name];
  if (!contract) throw new Error(`${name} is not in ${SDK_FIXTURE_PATH.pathname}`);
  return contract;
}
