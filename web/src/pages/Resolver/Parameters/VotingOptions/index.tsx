import React from "react";
import Header from "pages/Resolver/Header";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";
import { AlertMessage } from "@kleros/ui-components-library";
import LabeledInput from "components/LabeledInput";
import { useNewDisputeContext } from "context/NewDisputeContext";
import NavigationButtons from "../../NavigationButtons";
import OptionsFields from "./OptionsFields";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const QuestionField = styled(LabeledInput)`
  margin-bottom: 78px;
`;

const AlertMessageContainer = styled.div`
  width: 84vw;
  ${landscapeStyle(
    () => css`
      width: ${responsiveSize(442, 700, 900)};
    `
  )}
  > div {
    width: 100%;
  }
`;

const VotingOptions: React.FC = () => {
  const { disputeData, setDisputeData } = useNewDisputeContext();

  const handleQuestionWrite = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDisputeData({ ...disputeData, question: event.target.value });
  };

  return (
    <Container>
      <Header text="Voting options" />
      <QuestionField
        label="Question"
        placeholder="eg. How much should Alice receive?"
        message="Type the question jurors will see when voting."
        variant="info"
        value={disputeData.question}
        onChange={handleQuestionWrite}
      />
      <OptionsFields />
      <AlertMessageContainer>
        <AlertMessage
          title="Add the question and options jurors will see when voting"
          msg="Make it clear and objective."
          variant="info"
        />
      </AlertMessageContainer>
      <NavigationButtons prevRoute="/resolver/jurors" nextRoute="/resolver/notablepersons" />
    </Container>
  );
};
export default VotingOptions;
