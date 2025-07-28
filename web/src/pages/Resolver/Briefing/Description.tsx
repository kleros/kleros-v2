import React, { useRef, useEffect } from "react";
import styled, { css } from "styled-components";

import { Textarea } from "@kleros/ui-components-library";

import { useNewDisputeContext } from "context/NewDisputeContext";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import Header from "pages/Resolver/Header";

import NavigationButtons from "../NavigationButtons";

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
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWrite = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDisputeData({ ...disputeData, description: event.target.value });
  };

  useEffect(() => {
    if (containerRef.current) {
      const textareaElement = containerRef.current.querySelector("textarea");
      if (textareaElement) {
        textareaElement.focus();
      }
    }
  }, []);

  return (
    <Container ref={containerRef}>
      <Header text="Describe the case" />
      <StyledTextArea
        dir="auto"
        onChange={handleWrite}
        value={disputeData.description}
        placeholder="eg. Bob hired Alice to develop a website for him. Bob claims the contract was not fully respected, and the website was delivered incomplete. For that reason, he wants to pay part of the agreed payment: 150 DAI. On the other hand, Alice claims she should receive the full payment: 250 DAI."
      />
      <NavigationButtons prevRoute="/resolver/title" nextRoute="/resolver/court" />
    </Container>
  );
};

export default Description;
