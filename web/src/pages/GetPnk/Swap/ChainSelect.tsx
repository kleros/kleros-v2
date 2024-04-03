import React from "react";
import { arbitrum, arbitrumSepolia, gnosis, gnosisChiado, goerli, mainnet, polygon, polygonMumbai } from "viem/chains";
import EthIcon from "tsx:svgs/tokens/eth.svg";
import ArbitrumIcon from "tsx:svgs/tokens/arbitrum.svg";
import GnosisIcon from "tsx:svgs/tokens/gnosis.svg";
import PolygonIcon from "tsx:svgs/tokens/polygon.svg";
import StyledDropdown from "../StyledDropdown";
import { useLifiSDK } from "context/LiFiProvider";

const supportedChains = false
  ? [
      { value: goerli.id, text: mainnet.name, Icon: EthIcon },
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

const ChainSelect: React.FC = () => {
  const { swapData, setSwapData } = useLifiSDK();
  return (
    <StyledDropdown
      smallButton
      defaultValue={swapData.fromChainId}
      callback={(val) =>
        setSwapData({
          ...swapData,
          fromChainId: Number(val),
          fromTokenAddress: "0x0000000000000000000000000000000000000000", // set to native token on chain change
        })
      }
      items={supportedChains}
    />
  );
};

export default ChainSelect;
