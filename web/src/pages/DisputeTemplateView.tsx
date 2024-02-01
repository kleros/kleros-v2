import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Field, Textarea } from "@kleros/ui-components-library";
import PolicyIcon from "svgs/icons/policy.svg";
import ReactMarkdown from "components/ReactMarkdown";
import { INVALID_DISPUTE_DATA_ERROR, IPFS_GATEWAY } from "consts/index";
import { configureSDK } from "@kleros/kleros-sdk/src/sdk";
import { executeActions } from "@kleros/kleros-sdk/src/dataMappings/executeActions";
import { populateTemplate } from "@kleros/kleros-sdk/src/dataMappings/utils/populateTemplate";
import { Answer, DisputeDetails } from "@kleros/kleros-sdk/src/dataMappings/utils/disputeDetailsTypes";
import { alchemyApiKey } from "context/Web3Provider";

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

const LongTextSections = styled.div`
  min-height: calc(100vh - 144px);
  margin: 24px;
  display: flex;
  gap: 12px;
`;

const StyledTextArea = styled(Textarea)`
  width: 30vw;
  height: calc(100vh - 300px);
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 24px;
  margin-left: 24px;
`;

const StyledRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 24px;
`;

const StyledP = styled.p`
  font-style: italic;
`;

const StyledHeader = styled.h1`
  margin-left: 24px;
  margin-top 24px;
`;

const LongText = styled.div`
  display: flex;
  flex-direction: column;
  width: auto;
`;

const DisputeTemplateView: React.FC = () => {
  const [disputeDetails, setDisputeDetails] = useState<DisputeDetails | undefined>(undefined);
  const [disputeTemplateInput, setDisputeTemplateInput] = useState<string>("");
  const [dataMappingsInput, setDataMappingsInput] = useState<string>("");

  const [arbitrator, setArbitrator] = useState("");
  const [arbitrable, setArbitrable] = useState("");
  const [arbitrableDisputeID, setArbitrableDisputeID] = useState("");
  const [externalDisputeID, setExternalDisputeID] = useState("");
  const [templateID, setTemplateID] = useState("");
  const [templateUri, setTemplateUri] = useState("");

  useEffect(() => {
    configureSDK({ apiKey: alchemyApiKey });

    const initialContext = {
      arbitrator: arbitrator,
      arbitrable: arbitrable,
      arbitrableDisputeID: parseInt(arbitrableDisputeID),
      externalDisputeID: parseInt(externalDisputeID),
      templateID: parseInt(templateID),
      templateUri: templateUri,
    };

    if (!disputeTemplateInput || !dataMappingsInput) return;

    const fetchData = async () => {
      try {
        const parsedMappings = JSON.parse(dataMappingsInput);
        const data = await executeActions(parsedMappings, initialContext);
        const finalDisputeDetails = populateTemplate(disputeTemplateInput, data);
        setDisputeDetails(finalDisputeDetails);
        console.log("finalTemplate: ", finalDisputeDetails);
      } catch (e) {
        console.error(e);
        setDisputeDetails(undefined);
      }
    };

    fetchData();
  }, [
    disputeTemplateInput,
    dataMappingsInput,
    arbitrable,
    arbitrator,
    arbitrableDisputeID,
    externalDisputeID,
    templateID,
    templateUri,
  ]);

  return (
    <>
      <StyledHeader>Dispute Preview</StyledHeader>
      <StyledForm>
        <StyledP>Dispute Request event parameters</StyledP>
        <StyledRow>
          <p>Arbitrator</p>
          <Field
            type="text"
            value={arbitrator}
            onChange={(e) => setArbitrator(e.target.value)}
            placeholder="Enter arbitrator address"
          />
        </StyledRow>
        <StyledRow>
          <p>Arbitrable</p>
          <Field
            type="text"
            value={arbitrable}
            onChange={(e) => setArbitrable(e.target.value)}
            placeholder="Enter arbitrable address"
          />
        </StyledRow>
        <StyledRow>
          <p>ArbitrableDisputeID</p>
          <Field
            type="text"
            value={arbitrableDisputeID}
            onChange={(e) => setArbitrableDisputeID(e.target.value)}
            placeholder="Enter arbitrableDisputeID"
          />
        </StyledRow>
        <StyledRow>
          <p>ExternalDisputeID</p>
          <Field
            type="text"
            value={externalDisputeID}
            onChange={(e) => setExternalDisputeID(e.target.value)}
            placeholder="Enter externalDisputeID"
          />
        </StyledRow>
        <StyledRow>
          <p>TemplateID</p>
          <Field
            type="text"
            value={templateID}
            onChange={(e) => setTemplateID(e.target.value)}
            placeholder="Enter templateID"
          />
        </StyledRow>
        <StyledRow>
          <p>TemplateUri</p>
          <Field
            type="text"
            value={templateUri}
            onChange={(e) => setTemplateUri(e.target.value)}
            placeholder="Enter templateUri"
          />
        </StyledRow>
      </StyledForm>
      <LongTextSections>
        <LongText>
          <p>Template</p>
          <StyledTextArea
            value={disputeTemplateInput}
            onChange={(e) => setDisputeTemplateInput(e.target.value)}
            placeholder="Enter dispute template"
          />
        </LongText>
        <LongText>
          <p>Data Mapping</p>
          <StyledTextArea
            value={dataMappingsInput}
            onChange={(e) => setDataMappingsInput(e.target.value)}
            placeholder="Enter data mappings"
          />
        </LongText>
        <Overview disputeDetails={disputeDetails} />
      </LongTextSections>
    </>
  );
};

const Overview: React.FC<{ disputeDetails: DisputeDetails | undefined }> = ({ disputeDetails }) => {
  return (
    <>
      <Container>
        <h1>{disputeDetails?.title ?? INVALID_DISPUTE_DATA_ERROR}</h1>
        <QuestionAndDescription>
          <ReactMarkdown>{disputeDetails?.question ?? INVALID_DISPUTE_DATA_ERROR}</ReactMarkdown>
          <ReactMarkdown>{disputeDetails?.description ?? INVALID_DISPUTE_DATA_ERROR}</ReactMarkdown>
        </QuestionAndDescription>
        {disputeDetails?.frontendUrl && (
          <a href={disputeDetails?.frontendUrl} target="_blank" rel="noreferrer">
            Go to arbitrable
          </a>
        )}
        <VotingOptions>
          {disputeDetails && <h3>Voting Options</h3>}
          {disputeDetails?.answers?.map((answer: Answer, i: number) => (
            <span key={answer.id}>
              <small>Option {i + 1}:</small>
              <label>{answer.title}. </label>
              <label>{answer.description}</label>
            </span>
          ))}
        </VotingOptions>
        <ShadeArea>
          <p>Make sure you read and understand the Policies</p>
          <LinkContainer>
            {disputeDetails?.policyURI && (
              <StyledA href={`${IPFS_GATEWAY}${disputeDetails.policyURI}`} target="_blank" rel="noreferrer">
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
