import React from "react";
import Header from "pages/Resolver/Header";
import styled, { css } from "styled-components";
import NavigationButtons from "../NavigationButtons";
import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";
import LabeledInput from "~src/components/LabeledInput";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PartyOneContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 84vw;
  margin-bottom: 48px;
  ${landscapeStyle(
    () => css`
      width: ${responsiveSize(442, 700, 900)};
    `
  )}
`;

const PartyTwoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 84vw;

  ${landscapeStyle(
    () => css`
      width: ${responsiveSize(442, 700, 900)};
    `
  )}
`;

const CounterParties: React.FC = () => {
  return (
    <Container>
      <Header text="Counterparties" />

      <PartyOneContainer>
        <LabeledInput label="Party 1" placeholder="eg. Alice (Developer)" />
        <LabeledInput label="Party 1 Address" placeholder="eg. Alice.eth" />
      </PartyOneContainer>

      <PartyTwoContainer>
        <LabeledInput label="Party 2" placeholder="eg. Bob (Client)" />
        <LabeledInput label="Party 2 Address" placeholder="eg. 0x123456789a123456789b123456789123456789cd" />
      </PartyTwoContainer>

      <NavigationButtons prevRoute="/resolver/votingoptions" nextRoute="/resolver/policy" />
    </Container>
  );
};
export default CounterParties;
