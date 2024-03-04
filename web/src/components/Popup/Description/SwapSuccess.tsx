import React from "react";
import styled from "styled-components";
import { responsiveSize } from "styles/responsiveSize";
import PnkIcon from "svgs/tokens/pnk.svg";
import LightButton from "components/LightButton";
import ArrowIcon from "tsx:svgs/icons/arrow.svg";
import type { Route } from "@lifi/sdk";
import { getChain } from "pages/GetPnk/Swap/Cards/Routes/RouteDetails";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
  margin-top: 32px;
  gap: 24px;
`;

const AmountContainer = styled.div`
  display: flex;
  align-items: center;
  height: fit-content;
  gap: ${responsiveSize(16, 32)};
`;

const SVGContainer = styled.div`
  width: ${responsiveSize(30, 50)};
  height: ${responsiveSize(30, 50)};
`;

const Amount = styled.h1`
  color: ${({ theme }) => theme.secondaryPurple};
  font-size: ${responsiveSize(32, 44)};
  margin: 0px;
`;

const Subtitle = styled.label`
  display: flex;
`;

const StyledButton = styled(LightButton)`
  display: flex;
  flex-direction: row-reverse;
  gap: 8px;
  > .button-text {
    color: ${({ theme }) => theme.primaryBlue};
  }
  padding-top: 0px;
`;

const Divider = styled.hr`
  width: 100%;
  display: flex;
  border: none;
  height: 1px;
  background-color: ${({ theme }) => theme.stroke};
  margin: ${responsiveSize(32, 64)} 0px 0px;
`;
interface ISwapSuccess {
  hash?: string;
  amount: string;
  isClaim?: boolean;
  route?: Route;
}

const SwapSuccess: React.FC<ISwapSuccess> = ({ hash, amount, isClaim, route }) => {
  const baseUrl = isClaim ? `https://sepolia.arbiscan.io/tx/${hash}` : route?.steps[0].execution?.process[0].txLink;
  return (
    <Container>
      <AmountContainer>
        <Amount>{amount} PNK</Amount>
        <SVGContainer>
          <PnkIcon />
        </SVGContainer>
      </AmountContainer>
      {isClaim ? (
        <Subtitle>Claimed: {amount} PNK (Testnet)</Subtitle>
      ) : (
        <Subtitle>
          Bridge from &nbsp;<small>{getChain(route?.fromChainId ?? 1).name}</small>&nbsp; to &nbsp;
          <small>{getChain(route?.toChainId ?? 1).name}</small>
        </Subtitle>
      )}
      <Divider />
      <StyledButton
        onClick={() => window.open(baseUrl, "_blank", "rel=noopener noreferrer")}
        text={"View transaction on Etherscan"}
        Icon={ArrowIcon}
      />
    </Container>
  );
};

export default SwapSuccess;
