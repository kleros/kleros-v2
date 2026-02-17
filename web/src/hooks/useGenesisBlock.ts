import { useEffect, useState } from "react";

import { isKlerosUniversity, isProductionDeployment, isTestnetDeployment } from "src/consts";

/**
 * @returns genesis block for kleros core contract
 */
const useGenesisBlock = () => {
  const [genesisBlock, setGenesisBlock] = useState<number>();
  useEffect(() => {
    if (isKlerosUniversity()) {
      import("@kleros/kleros-v2-contracts/deployments/arbitrumSepoliaDevnet/KlerosCoreUniversity.json").then((json) =>
        setGenesisBlock(json.receipt.blockNumber)
      );
    } else if (isProductionDeployment()) {
      import("@kleros/kleros-v2-contracts/deployments/arbitrum/KlerosCore.json").then((json) =>
        setGenesisBlock(json.receipt.blockNumber)
      );
    } else if (isTestnetDeployment()) {
      import("@kleros/kleros-v2-contracts/deployments/arbitrumSepolia/KlerosCore.json").then((json) =>
        setGenesisBlock(json.receipt.blockNumber)
      );
    } else {
      import("@kleros/kleros-v2-contracts/deployments/arbitrumSepoliaDevnet/KlerosCore.json").then((json) =>
        setGenesisBlock(json.receipt.blockNumber)
      );
    }
  }, []);

  return genesisBlock;
};

export default useGenesisBlock;
