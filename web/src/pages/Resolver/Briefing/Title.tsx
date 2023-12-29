import React from "react";
import Header from "pages/Resolver/Header";
import styled, { css } from "styled-components";
import { Field } from "@kleros/ui-components-library";
import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";
import NavigationButtons from "../NavigationButtons";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
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
  return (
    <Container>
      <Header text="Choose a title" />
      <StyledField placeholder="eg. Freelance work disagreement between Alice and Bob" />
      <NavigationButtons prevRoute="/resolver/title" nextRoute="/resolver/description" />
    </Container>
  );
};
export default Title;
