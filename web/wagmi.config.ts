import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import { arbitrumGoerli } from "wagmi/chains";
import KlerosCore from "@kleros/kleros-v2-contracts/deployments/arbitrumGoerli/KlerosCore.json" assert { type: "json" };
import PNK from "@kleros/kleros-v2-contracts/deployments/arbitrumGoerli/PNK.json" assert { type: "json" };
import DisputeKitClassic from "@kleros/kleros-v2-contracts/deployments/arbitrumGoerli/DisputeKitClassic.json" assert { type: "json" };
import PolicyRegistry from "@kleros/kleros-v2-contracts/deployments/arbitrumGoerli/PolicyRegistry.json" assert { type: "json" };
import IMetaevidence from "@kleros/kleros-v2-contracts/artifacts/src/evidence/IMetaEvidence.sol/IMetaEvidence.json" assert { type: "json" };

export default defineConfig({
  out: "src/hooks/contracts/generated.ts",
  contracts: [
    {
      name: "KlerosCore",
      address: {
        [arbitrumGoerli.id]: KlerosCore.address,
      },
      abi: KlerosCore.abi,
    },
    {
      name: "DisputeKitClassic",
      address: {
        [arbitrumGoerli.id]: DisputeKitClassic.address,
      },
      abi: DisputeKitClassic.abi,
    },
    {
      name: "PNK",
      address: {
        [arbitrumGoerli.id]: PNK.address,
      },
      abi: PNK.abi,
    },
    {
      name: "PolicyRegistry",
      address: {
        [arbitrumGoerli.id]: PolicyRegistry.address,
      },
      abi: PolicyRegistry.abi,
    },
    {
      name: "IMetaEvidence",
      abi: IMetaevidence.abi,
    },
  ],
  plugins: [react()],
});
