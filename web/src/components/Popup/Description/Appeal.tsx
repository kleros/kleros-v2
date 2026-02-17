import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledAmountFunded = styled.div`
  display: flex;
  margin-left: ${responsiveSize(8, 44, 300)};
  margin-right: ${responsiveSize(8, 44, 300)};
  color: ${({ theme }) => theme.secondaryText};
  text-align: center;
`;

const StyledOptionFunded = styled.div`
  display: flex;
  margin-bottom: ${responsiveSize(16, 32, 300)};
  margin-left: ${responsiveSize(8, 44, 300)};
  margin-right: ${responsiveSize(8, 44, 300)};
  color: ${({ theme }) => theme.secondaryText};
  text-align: center;
`;

const AmountContainer = styled.div`
  color: ${({ theme }) => theme.primaryText};
`;

const OptionContainer = styled.div`
  color: ${({ theme }) => theme.primaryText};
`;

interface IAppeal {
  amount: string;
  option: string;
}

const Appeal: React.FC<IAppeal> = ({ amount, option }) => {
  const { t } = useTranslation();

  return (
    <Container>
      <StyledAmountFunded>
        {t("popups.you_have_funded")} &nbsp;<AmountContainer>{amount} ETH</AmountContainer>
      </StyledAmountFunded>
      <StyledOptionFunded>
        {t("popups.option_funded")} &nbsp;<OptionContainer>{option}</OptionContainer>
      </StyledOptionFunded>
    </Container>
  );
};
export default Appeal;
