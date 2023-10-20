import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { Textarea } from "@kleros/ui-components-library";
import PolicyIcon from "svgs/icons/policy.svg";
import { StyledSkeleton } from "components/StyledSkeleton";
import ReactMarkdown from "components/ReactMarkdown";
import { isUndefined } from "utils/index";
import { IPFS_GATEWAY } from "consts/index";

const Container = styled.div`
  width: 50%;
  height: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;

  > h1 {
    margin: 0;
  }

  > hr {
    width: 100%;
  }
`;

const QuestionAndDescription = styled.div`
  display: flex;
  flex-direction: column;
  > * {
    margin: 0px;
  }
`;

const VotingOptions = styled(QuestionAndDescription)`
  display: flex;
  flex-direction: column;
  > span {
    margin: 0px;
    display: flex;
    gap: 8px;
  }
`;

const ShadeArea = styled.div`
  width: 100%;
  padding: 16px;
  margin-top: 16px;
  background-color: ${({ theme }) => theme.mediumBlue};
  > p {
    margin-top: 0;
  }
`;

const StyledA = styled.a`
  display: flex;
  align-items: center;
  gap: 4px;
  > svg {
    width: 16px;
    fill: ${({ theme }) => theme.primaryBlue};
  }
`;

const LinkContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Wrapper = styled.div`
  min-height: calc(100vh - 144px);
  margin: 24px;
  display: flex;
  gap: 12px;
`;

const StyledTextArea = styled(Textarea)`
  width: 50%;
  height: calc(100vh - 300px);
`;

const DisputeTemplateView: React.FC = () => {
  const [disputeTemplate, setDisputeTemplate] = useState<string>("");
  const [errorMsg, setErrorMessage] = useState<string>("");
  const parsedDisputeTemplate = useMemo(() => {
    try {
      const parsed = JSON.parse(disputeTemplate);
      setErrorMessage("");
      return parsed;
    } catch (e) {
      setErrorMessage((e as SyntaxError).message);
      return undefined;
    }
  }, [disputeTemplate]);
  const isThereInput = useMemo(() => disputeTemplate !== "", [disputeTemplate]);
  return (
    <Wrapper>
      <StyledTextArea
        value={disputeTemplate}
        onChange={(e) => setDisputeTemplate(e.target.value)}
        placeholder="Enter dispute template"
        variant={isThereInput && errorMsg !== "" ? "error" : ""}
        message={isThereInput ? errorMsg : ""}
      />
      <Overview disputeTemplate={parsedDisputeTemplate} />
    </Wrapper>
  );
};

const Overview: React.FC<{ disputeTemplate: any }> = ({ disputeTemplate }) => {
  return (
    <>
      <Container>
        <h1>
          {isUndefined(disputeTemplate) ? (
            <StyledSkeleton />
          ) : (
            disputeTemplate?.title ?? "The dispute's template is not correct please vote refuse to arbitrate"
          )}
        </h1>
        <QuestionAndDescription>
          <ReactMarkdown>{disputeTemplate?.question}</ReactMarkdown>
          <ReactMarkdown>{disputeTemplate?.description}</ReactMarkdown>
        </QuestionAndDescription>
        {disputeTemplate?.frontendUrl && (
          <a href={disputeTemplate?.frontendUrl} target="_blank" rel="noreferrer">
            Go to arbitrable
          </a>
        )}
        <VotingOptions>
          {disputeTemplate && <h3>Voting Options</h3>}
          {disputeTemplate?.answers?.map((answer: { title: string; description: string }, i: number) => (
            <span key={i}>
              <small>Option {i + 1}:</small>
              <label>{answer.title}</label>
            </span>
          ))}
        </VotingOptions>
        <ShadeArea>
          <p>Make sure you read and understand the Policies</p>
          <LinkContainer>
            {disputeTemplate?.policyURI && (
              <StyledA href={`${IPFS_GATEWAY}${disputeTemplate.policyURI}`} target="_blank" rel="noreferrer">
                <PolicyIcon />
                Dispute Policy
              </StyledA>
            )}
          </LinkContainer>
        </ShadeArea>
      </Container>
    </>
  );
};

export default DisputeTemplateView;
