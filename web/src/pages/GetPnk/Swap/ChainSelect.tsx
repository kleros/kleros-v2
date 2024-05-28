import React from "react";

import { arbitrum, arbitrumSepolia, gnosis, gnosisChiado, mainnet, polygon, polygonMumbai, sepolia } from "viem/chains";

import ArbitrumIcon from "svgs/tokens/arbitrum.svg";
import EthIcon from "svgs/tokens/eth.svg";
import GnosisIcon from "svgs/tokens/gnosis.svg";
import PolygonIcon from "svgs/tokens/polygon.svg";

import StyledDropdown from "../StyledDropdown";

const supportedChains = true
  ? [
      { value: sepolia.id, text: mainnet.name, Icon: EthIcon },
      { value: arbitrumSepolia.id, text: "Arbitrum", Icon: ArbitrumIcon },
      { value: gnosisChiado.id, text: gnosis.name, Icon: GnosisIcon },
      { value: polygonMumbai.id, text: polygon.name, Icon: PolygonIcon },
    ]
  : [
      { value: mainnet.id, text: mainnet.name, Icon: EthIcon },
      { value: arbitrum.id, text: "Arbitrum", Icon: ArbitrumIcon },
      { value: gnosis.id, text: gnosis.name, Icon: GnosisIcon },
      { value: polygon.id, text: polygon.name, Icon: PolygonIcon },
    ];

interface IChainSelect {
  chainId: number;
  setChainId: React.Dispatch<React.SetStateAction<number>>;
}
const ChainSelect: React.FC<IChainSelect> = ({ chainId, setChainId }) => (
  <StyledDropdown
    smallButton
    defaultValue={chainId}
    callback={(val) => setChainId(Number(val))}
    items={supportedChains}
  />
);

export default ChainSelect;
