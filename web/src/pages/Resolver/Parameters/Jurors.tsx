import React from "react";
import Header from "pages/Resolver/Header";
import styled from "styled-components";
import { DropdownSelect, Field } from "@kleros/ui-components-library";
import NavigationButtons from "../NavigationButtons";
import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledDropdownSelect = styled(DropdownSelect)`
  width: 290px;
  margin-bottom: 32px;
  button {
    width: 100%;
  }
  div {
    width: 100%;
  }
`;

const StyledField = styled(Field)`
  width: 290px;
  margin-bottom: ${responsiveSize(20, 48)};
`;

const StyledLabel = styled.label`
  width: 290px;
  margin-bottom: 12px;
`;

const Jurors: React.FC = () => {
  return (
    <Container>
      <Header text="Select the number of jurors" />
      <StyledDropdownSelect
        items={[
          { value: 1, text: "3" },
          { value: 2, text: "7" },
        ]}
        placeholder={{ text: "3" }}
        callback={() => {}}
      />
      <StyledLabel id="fee">Arbitration Fee</StyledLabel>
      <StyledField placeholder="0.0X ETH" id="fee" />
      <NavigationButtons prevRoute="/resolver/category" nextRoute="/resolver/votingoptions" />
    </Container>
  );
};
export default Jurors;
