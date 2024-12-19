import React from "react";
import styled, { css } from "styled-components";

import { Field } from "@kleros/ui-components-library";

import { useNewDisputeContext } from "context/NewDisputeContext";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import Header from "pages/Resolver/Header";

import NavigationButtons from "../NavigationButtons";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  ${landscapeStyle(
    () => css`
      padding-bottom: 240px;
    `
  )}
`;

const StyledField = styled(Field)`
  width: 84vw;

  ${landscapeStyle(
    () => css`
      width: ${responsiveSize(442, 700, 900)};
    `
  )}
`;
const Title: React.FC = () => {
  const { disputeData, setDisputeData } = useNewDisputeContext();

  const handleWrite = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDisputeData({ ...disputeData, title: event.target.value });
  };

  return (
    <Container>
      <Header text="Choose a title" />
      <StyledField
        dir="auto"
        onChange={handleWrite}
        placeholder="eg. Freelance work disagreement between Alice and Bob"
        value={disputeData.title}
      />
      <NavigationButtons prevRoute="" nextRoute="/resolver/description" />
    </Container>
  );
};
export default Title;
