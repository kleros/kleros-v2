import { getDisputeKits } from "../deployments/disputeKitsViem";
import { createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";

const rpc = process.env.ARBITRUM_SEPOLIA_RPC;
if (!rpc) {
  throw new Error("ARBITRUM_SEPOLIA_RPC is not set");
}

const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(rpc),
});

async function main() {
  try {
    console.log("Fetching DisputeKitCreated events...");
    const disputeKitResult = await getDisputeKits(client, "devnet");
    console.log(disputeKitResult);
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
