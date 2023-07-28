import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledAmountFunded = styled.div`
  display: flex;
  margin-left: calc(8px + (44 - 8) * ((100vw - 300px) / (1250 - 300)));
  margin-right: calc(8px + (44 - 8) * ((100vw - 300px) / (1250 - 300)));
  color: ${({ theme }) => theme.secondaryText};
  text-align: center;
`;

const StyledOptionFunded = styled.div`
  display: flex;
  margin-bottom: calc(16px + (32 - 16) * ((100vw - 300px) / (1250 - 300)));
  margin-left: calc(8px + (44 - 8) * ((100vw - 300px) / (1250 - 300)));
  margin-right: calc(8px + (44 - 8) * ((100vw - 300px) / (1250 - 300)));
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
  return (
    <Container>
      <StyledAmountFunded>
        You have funded &nbsp;<AmountContainer>{amount} ETH</AmountContainer>
      </StyledAmountFunded>
      <StyledOptionFunded>
        Option funded: &nbsp;<OptionContainer>{option}</OptionContainer>
      </StyledOptionFunded>
    </Container>
  );
};
export default Appeal;
