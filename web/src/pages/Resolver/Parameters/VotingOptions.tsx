import React from "react";
import Header from "pages/Resolver/Header";
import styled, { css } from "styled-components";
import NavigationButtons from "../NavigationButtons";
import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";
import { AlertMessage } from "@kleros/ui-components-library";
import LabeledInput from "components/LabeledInput";
import { Answer, useNewDisputeContext } from "context/NewDisputeContext";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const QuestionField = styled(LabeledInput)`
  margin-bottom: 58px;
`;

const OptionsContainer = styled.div`
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

const AlertMessageContainer = styled.div`
  width: 84vw;
  ${landscapeStyle(
    () => css`
      width: ${responsiveSize(442, 700, 900)};
    `
  )}
  margin-top: 24px;
  > div {
    width: 100%;
  }
`;
const VotingOptions: React.FC = () => {
  const { disputeData, setDisputeData } = useNewDisputeContext();

  const handleQuestionWrite = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDisputeData({ ...disputeData, question: event.target.value });
  };

  //TODO: add description too and implement multiple options
  const handleOptionWrite = (event: React.ChangeEvent<HTMLInputElement>, key: number) => {
    let answers: Answer[] = disputeData.answers;
    answers[key].title = event.target.value;
    setDisputeData({ ...disputeData, answers });
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
      {/* TODO: Add multi-vote support */}
      <OptionsContainer>
        <LabeledInput
          label="Voting Option 1"
          placeholder="eg. Pay 250 DAI"
          key={0}
          value={disputeData.answers[0]?.title ?? ""}
          onChange={(event) => handleOptionWrite(event, 0)}
        />
        <LabeledInput
          label="Voting Option 2"
          placeholder="eg. Pay 150 DAI"
          key={1}
          value={disputeData.answers[1]?.title ?? ""}
          onChange={(event) => handleOptionWrite(event, 1)}
        />
      </OptionsContainer>

      <AlertMessageContainer>
        <AlertMessage
          title="Add the question and options jurors will see when voting"
          msg="Make it clear and objective."
          variant="info"
        />
      </AlertMessageContainer>
      <NavigationButtons prevRoute="/resolver/jurors" nextRoute="/resolver/counterparties" />
    </Container>
  );
};
export default VotingOptions;
