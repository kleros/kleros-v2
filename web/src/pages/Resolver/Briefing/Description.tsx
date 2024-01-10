import React from "react";
import Header from "pages/Resolver/Header";
import styled, { css } from "styled-components";
import { Textarea } from "@kleros/ui-components-library";
import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";
import NavigationButtons from "../NavigationButtons";
import { useNewDisputeContext } from "context/NewDisputeContext";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const StyledTextArea = styled(Textarea)`
  width: 84vw;
  height: 300px;
  ${landscapeStyle(
    () => css`
      width: ${responsiveSize(442, 700, 900)};
    `
  )}
`;
const Description: React.FC = () => {
  const { disputeData, setDisputeData } = useNewDisputeContext();

  const handleWrite = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDisputeData({ ...disputeData, description: event.target.value });
  };

  return (
    <Container>
      <Header text="Describe the case" />
      <StyledTextArea
        onChange={handleWrite}
        value={disputeData.description}
        placeholder="eg. Bob hired Alice to develop a website for him. Bob claims the contract was not fully respected, and the website was delivered incomplete. For that reason, he wants to pay part of the agreed payment: 150 DAI. On the other hand, Alice claims she should receive the full payment: 250 DAI."
      />
      <NavigationButtons prevRoute="/resolver/title" nextRoute="/resolver/court" />
    </Container>
  );
};
export default Description;
