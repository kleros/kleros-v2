import { getDispute } from "@kleros/kleros-sdk";
import { getEnvConfig } from "../config";
import { arbitrum } from "viem/chains";
import { alchemyTransport } from "./rpc";

// returns undefined if the dispute is broken
export async function fetchPopulatedDisputeData(disputeId: string) {
  const config = getEnvConfig();
  try {
    const data = await getDispute({
      disputeId: BigInt(disputeId),
      coreSubgraph: config.coreSubgraphUrl,
      dtrSubgraph: config.dtrSubgraphUrl,
      options: {
        sdkConfig: {
          client: {
            // NOTE: temporary, since we are archiving data from arbitrum to arbitrum sepolia for test. sdk still requires arbitrum rpc
            chain: arbitrum,
            transport: alchemyTransport(arbitrum.id),
          },
        },
        additionalContext: {
          graphApiKey: config.graphApiKey,
        },
      },
    });

    return data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      // dispute is broken
      console.log(`Unable to fetch populated data for dispute ${disputeId}: ${error.message}`);
    }
    return undefined;
  }
}
