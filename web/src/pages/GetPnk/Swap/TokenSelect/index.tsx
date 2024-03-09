import React, { useMemo } from "react";
import StyledDropdown from "../../StyledDropdown";
import { useLifiSDK } from "context/LiFiProvider";
import { Card, _IItem1 } from "@kleros/ui-components-library";
import styled from "styled-components";
import EthIcon from "assets/svgs/tokens/eth.svg";
import { responsiveSize } from "styles/responsiveSize";
import { useTokenSelectContext } from "./TokenSelectProvider";
import Header from "./Header";
import SearchableSelect from "components/SearchableSelect";

const StyledSVGContainer = styled.div`
  margin-right: 8px;
  border-radius: 50%;
  overflow: hidden;
`;

const SelectContainer = styled(Card)`
  display: flex;
  flex-direction: column;
  width: ${responsiveSize(360, 500)};
  height: fit-content;
`;

const Icon: React.FC<{ img?: string }> = ({ img }) => {
  return (
    <StyledSVGContainer>
      {img ? (
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
          <image width="24" height="24" href={img} />
        </svg>
      ) : (
        <EthIcon />
      )}
    </StyledSVGContainer>
  );
};

const TokenSelect: React.FC = () => {
  const { selectingToken, toggleTokenSelect } = useTokenSelectContext();
  const { tokens, swapData, setSwapData } = useLifiSDK();

  const supportedTokens = useMemo(
    () =>
      tokens.reduce<_IItem1[]>((acc, current) => {
        acc.push({
          text: current.symbol,
          value: current.address,
          icon: <Icon img={current.logoURI} />,
        });
        return acc;
      }, []),
    [tokens]
  );

  const handleTokenChange = (val: string | number) => {
    const selectedAddress = val.toString();
    const selectedToken = tokens.find((token) => token.address === selectedAddress);

    setSwapData({
      ...swapData,
      fromTokenAddress: selectedAddress,
      fromToken: selectedToken,
    });
    toggleTokenSelect();
  };
  return selectingToken ? (
    <SelectContainer>
      <Header />
      <SearchableSelect
        defaultValue={swapData.fromTokenAddress}
        callback={handleTokenChange}
        items={supportedTokens}
        highlightedItems={supportedTokens.slice(0, 5)}
      />
    </SelectContainer>
  ) : (
    <div onClick={toggleTokenSelect}>
      <StyledDropdown
        smallButton
        defaultValue={swapData.fromTokenAddress}
        items={supportedTokens}
        callback={handleTokenChange}
      />
    </div>
  );
};

export default TokenSelect;
