import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import ArrowIcon from "svgs/icons/arrow.svg";
import PnkIcon from "svgs/tokens/pnk.svg";

import { responsiveSize } from "styles/responsiveSize";

import { Divider } from "components/Divider";
import LightButton from "components/LightButton";
import { Token } from "pages/GetPnk/Swap/TokenSelect";

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
  font-size: ${responsiveSize(32, 64)};
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

const StyledDivider = styled(Divider)`
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
  const { t } = useTranslation();
  const baseUrl = `https://sepolia.arbiscan.io/tx/${hash}`;
  return (
    <Container>
      <AmountContainer>
        <Amount>{amount} PNK</Amount>
        <SVGContainer>
          <PnkIcon />
        </SVGContainer>
      </AmountContainer>
      {isClaim ? (
        <Subtitle>{t("swap.claimed_testnet", { amount })}</Subtitle>
      ) : (
        <Subtitle>
          {t("swap.bridge_from")} &nbsp;<small>Ethereum</small>&nbsp; {t("swap.to")} &nbsp;<small>Arbitrum</small>
        </Subtitle>
      )}
      <StyledDivider />
      <StyledButton
        onClick={() => window.open(baseUrl, "_blank", "rel=noopener noreferrer")}
        text={t("buttons.view_transaction_etherscan")}
        Icon={ArrowIcon}
      />
    </Container>
  );
};

export default SwapSuccess;
