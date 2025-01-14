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
      padding-bottom: 191px;
    `
  )}
`;

const StyledField = styled(Field)`
  width: 84vw;
  margin-bottom: 74px;
  ${landscapeStyle(
    () => css`
      width: ${responsiveSize(442, 700, 900)};
      margin-bottom: 64px;
    `
  )}
  > small {
    margin-top: 16px;
  }
`;

const Category: React.FC = () => {
  const { disputeData, setDisputeData } = useNewDisputeContext();

  const handleWrite = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDisputeData({ ...disputeData, category: event.target.value });
  };
  return (
    <Container>
      <Header text="Choose a category" />
      <StyledField
        dir="auto"
        onChange={handleWrite}
        value={disputeData.category}
        placeholder="eg. Freelance"
        variant="info"
        message="Type the category tag that you think best represents the case. eg. General, Curation, Freelancing, Listing, Insurance, Translation, Oracle, Identity, E-Commerce, etc."
      />
      <NavigationButtons prevRoute="/resolver/court" nextRoute="/resolver/jurors" />
    </Container>
  );
};
export default Category;
