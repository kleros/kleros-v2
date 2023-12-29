import React from "react";
import Header from "pages/Resolver/Header";
import styled, { css } from "styled-components";
import { AlertMessage, DropdownSelect } from "@kleros/ui-components-library";
import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";
import NavigationButtons from "../NavigationButtons";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledDropdownSelect = styled(DropdownSelect)`
  width: 84vw;
  ${landscapeStyle(
    () => css`
      width: ${responsiveSize(442, 700, 900)};
    `
  )}
  button {
    width: 100%;
  }
  div {
    width: 100%;
  }
`;

const AlertMessageContainer = styled.div`
  width: 84vw;
  ${landscapeStyle(
    () => css`
      width: ${responsiveSize(442, 700, 900)};
    `
  )}
  margin-top: 24px;
`;

const Court: React.FC = () => {
  return (
    <Container>
      <Header text="Select a court to arbitrate the case" />
      <StyledDropdownSelect
        items={[
          { value: 1, text: "General court" },
          { value: 2, text: "Curation court" },
        ]}
        placeholder={{ text: "Select a court" }}
        callback={() => {}}
      />
      <AlertMessageContainer>
        <AlertMessage
          title="Check the courts available beforehand"
          msg="Kleros has different courts arbitrating disputes in several areas. Each court has its own purpose and policy. Take some time to choose the best court for your case. Learn more about the available courts here."
          variant="info"
        />
      </AlertMessageContainer>
      <NavigationButtons prevRoute="/resolver/description" nextRoute="/resolver/category" />
    </Container>
  );
};
export default Court;
