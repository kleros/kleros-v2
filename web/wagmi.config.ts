import { defineConfig } from "@wagmi/cli";
import { react, actions } from "@wagmi/cli/plugins";
import { arbitrumGoerli } from "wagmi/chains";
import KlerosCore from "@kleros/kleros-v2-contracts/deployments/arbitrumGoerli/KlerosCore.json" assert { type: "json" };
import PNK from "@kleros/kleros-v2-contracts/deployments/arbitrumGoerli/PNK.json" assert { type: "json" };
import DisputeKitClassic from "@kleros/kleros-v2-contracts/deployments/arbitrumGoerli/DisputeKitClassic.json" assert { type: "json" };
import PolicyRegistry from "@kleros/kleros-v2-contracts/deployments/arbitrumGoerli/PolicyRegistry.json" assert { type: "json" };
import IArbitrableV2 from "@kleros/kleros-v2-contracts/artifacts/src/arbitration/interfaces/IArbitrableV2.sol/IArbitrableV2.json" assert { type: "json" };
import IHomeGateway from "@kleros/kleros-v2-contracts/artifacts/src/gateway/interfaces/IHomeGateway.sol/IHomeGateway.json" assert { type: "json" };
import PNKFaucet from "@kleros/kleros-v2-contracts/deployments/arbitrumGoerli/PNKFaucet.json" assert { type: "json" };

export default defineConfig({
  out: "src/hooks/contracts/generated.ts",
  contracts: [
    {
      name: "KlerosCore",
      address: {
        [arbitrumGoerli.id]: KlerosCore.address as `0x{string}`,
      },
      abi: KlerosCore.abi,
    },
    {
      name: "DisputeKitClassic",
      address: {
        [arbitrumGoerli.id]: DisputeKitClassic.address as `0x{string}`,
      },
      abi: DisputeKitClassic.abi,
    },
    {
      name: "PNK",
      address: {
        [arbitrumGoerli.id]: PNK.address as `0x{string}`,
      },
      abi: PNK.abi,
    },
    {
      name: "PolicyRegistry",
      address: {
        [arbitrumGoerli.id]: PolicyRegistry.address as `0x{string}`,
      },
      abi: PolicyRegistry.abi,
    },
    {
      name: "IArbitrableV2",
      abi: IArbitrableV2.abi,
    },
    {
      name: "IHomeGateway",
      abi: IHomeGateway.abi,
    },
    {
      name: "PNKFaucet",
      address: {
        [arbitrumGoerli.id]: PNKFaucet.address as `0x{string}`,
      },
      abi: PNKFaucet.abi,
    },
  ],
  plugins: [react(), actions()],
});
