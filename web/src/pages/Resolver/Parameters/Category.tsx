import React from "react";
import Header from "pages/Resolver/Header";
import styled, { css } from "styled-components";
import { Field } from "@kleros/ui-components-library";
import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";
import NavigationButtons from "../NavigationButtons";
import { useNewDisputeContext } from "context/NewDisputeContext";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
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
