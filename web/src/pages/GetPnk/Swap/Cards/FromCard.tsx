import React from "react";
import { Button, Card } from "@kleros/ui-components-library";
import styled from "styled-components";
import ChainSelect from "../ChainSelect";
import TokenSelect from "../TokenSelect";
import { responsiveSize } from "styles/responsiveSize";
import NumberField from "../NumberInput";
import DownArrow from "tsx:svgs/icons/down-arrow.svg";
import WalletIcon from "tsx:svgs/icons/wallet.svg";
import { useLifiSDK } from "context/LiFiProvider";
import NumberDisplay from "components/NumberDisplay";
import Skeleton from "react-loading-skeleton";
import { useAccount } from "wagmi";

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
  gap: 8px;
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

const BalanceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BalanceDisplay = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const BalanceLabel = styled.label`
  font-size: 12px;
`;

const FromCard: React.FC = () => {
  const { swapData, setSwapData } = useLifiSDK();
  const { isConnected } = useAccount();

  const handleMax = () => {
    if (!swapData.tokenBalance) return;
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
        <BalanceContainer>
          {isConnected ? (
            <BalanceDisplay>
              <WalletIcon />
              <BalanceLabel>
                {swapData?.tokenBalance ? (
                  <NumberDisplay
                    value={swapData.tokenBalance}
                    showUnitInDisplay={false}
                    unit={swapData?.fromToken?.symbol ?? "ETH"}
                  />
                ) : (
                  <Skeleton width={50} height={12} />
                )}
              </BalanceLabel>
            </BalanceDisplay>
          ) : null}
          <StyledButton variant="secondary" text="Max" onClick={handleMax} />
        </BalanceContainer>
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
