import { Button } from "@kleros/ui-components-library";
import React from "react";
import styled from "styled-components";
import GasIcon from "tsx:svgs/icons/gas.svg";
import { useLifiSDK } from "context/LiFiProvider";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.primaryText};
`;

const GridContainer = styled.div`
  --gap: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, max(100px, (100% - 54px - var(--gap) * 2)/3)), 1fr));
  align-items: center;
  gap: var(--gap);
`;

const StyledButton = styled(Button)<{ selected?: boolean }>`
  width: 100%;
  height: 80px;
  border-color: ${({ theme, selected }) => (selected ? theme.primaryBlue : theme.stroke)};
  background-color: ${({ theme, selected }) => (selected ? theme.lightBlue : theme.whiteBackground)};

  .button-text {
    color: ${({ theme, selected }) => (selected ? theme.primaryBlue : theme.secondaryText)};
  }
`;

const Settings: React.FC = () => {
  const slippageOptions = [0.03, 0.05, 0.1];
  const gasOptions = ["Slow", "Normal", "Fast"];
  const { swapData, setSwapData } = useLifiSDK();

  return (
    <Container>
      <InnerContainer>
        <Header>
          <StyledLabel>Slippage</StyledLabel>
        </Header>
        <GridContainer>
          {slippageOptions.map((val, i) => (
            <StyledButton
              key={val}
              text={`${val * 100}%`}
              variant="secondary"
              selected={val === swapData.slippage}
              onClick={() => setSwapData({ ...swapData, slippage: val })}
            />
          ))}
        </GridContainer>
      </InnerContainer>
      <InnerContainer>
        <Header>
          <StyledLabel>Gas</StyledLabel>
          <GasIcon />
        </Header>
        <GridContainer>
          {gasOptions.map((val, i) => (
            <StyledButton
              key={val}
              text={val}
              variant="secondary"
              selected={val.toLowerCase() === swapData.gasPrice}
              onClick={() => setSwapData({ ...swapData, gasPrice: val.toLowerCase() })}
            />
          ))}
        </GridContainer>
      </InnerContainer>
    </Container>
  );
};
export default Settings;
