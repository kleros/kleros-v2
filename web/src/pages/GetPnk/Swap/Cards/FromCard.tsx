import React from "react";
import { Button, Card } from "@kleros/ui-components-library";
import styled from "styled-components";
import ChainSelect from "../ChainSelect";
import TokenSelect from "../TokenSelect";
import { responsiveSize } from "styles/responsiveSize";
import NumberField from "../NumberInput";
import DownArrow from "tsx:svgs/icons/down-arrow.svg";
import { useLifiSDK } from "context/LiFiProvider";

const Container = styled(Card)`
  width: 100%;
  display: flex;
  height: fit-content;
  flex-direction: column;
  gap: 19px;
  padding: 16px 16px 32px;
  background-color: ${({ theme }) => theme.lightBlue};
  border-color: ${({ theme }) => theme.primaryBlue};
  position: relative;
`;
const InnerContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const ChainContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${responsiveSize(8, 16)};
`;
const StyledButton = styled(Button)`
  border: none;
  background-color: transparent;
  padding: 0;
`;

const SVGContainer = styled.div`
  display: flex;
  justify-content: center;
  position: absolute;
  left: 0;
  right: 0;
  bottom: -28px;
  z-index: 9;
`;
const StyledLabel = styled.label``;

const FromCard: React.FC = () => {
  const { swapData, setSwapData } = useLifiSDK();

  const handleMax = () => {
    if (!swapData.tokenBalance) return;
    console.log({ swapData });

    setSwapData({
      ...swapData,
      fromAmount: swapData.tokenBalance,
    });
  };
  return (
    <Container>
      <InnerContainer>
        <ChainContainer>
          <StyledLabel>From</StyledLabel>
          <ChainSelect />
        </ChainContainer>
        <StyledButton variant="secondary" text="Max" onClick={handleMax} />
      </InnerContainer>
      <InnerContainer>
        <TokenSelect />
        <NumberField
          placeholder="Enter amount"
          value={swapData.fromAmount}
          onChange={(val) =>
            setSwapData({
              ...swapData,
              fromAmount: val,
            })
          }
        />
      </InnerContainer>
      <SVGContainer>
        <DownArrow />
      </SVGContainer>
    </Container>
  );
};

export default FromCard;
