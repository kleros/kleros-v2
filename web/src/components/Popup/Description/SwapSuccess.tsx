import React from "react";
import styled from "styled-components";
import { responsiveSize } from "styles/responsiveSize";
import PnkIcon from "svgs/tokens/pnk.svg";
import { Token } from "pages/GetPnk/Swap/TokenSelect";
import LightButton from "components/LightButton";
import ArrowIcon from "tsx:svgs/icons/arrow.svg";

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
  width: 50px;
  height: 50px;
`;

const Amount = styled.h1`
  color: ${({ theme }) => theme.secondaryPurple};
  font-size: 64px;
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
  hash: string;
  amount: string;
  from?: Token;
  to?: Token;
  isClaim?: boolean;
}

const SwapSuccess: React.FC<ISwapSuccess> = ({ hash, amount, isClaim, from, to }) => {
  const baseUrl = "https://etherscan.io/tx/0x015921dd855ea5b1fe19ea027f97e221b5c8f0362bdc267a3e4ce6ffd6c191ab";
  return (
    <Container>
      <AmountContainer>
        <Amount>1000 PNK</Amount>
        <SVGContainer>
          <PnkIcon />
        </SVGContainer>
      </AmountContainer>
      {isClaim ? (
        <Subtitle>Claimed: 1000 PNK (Testnet)</Subtitle>
      ) : (
        <Subtitle>
          Bridge from &nbsp;<small>Ethereum</small>&nbsp; to &nbsp;<small>Arbitrum</small>
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
