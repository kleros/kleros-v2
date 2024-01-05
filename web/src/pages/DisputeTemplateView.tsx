import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Textarea } from "@kleros/ui-components-library";
import PolicyIcon from "svgs/icons/policy.svg";
import ReactMarkdown from "components/ReactMarkdown";
import { INVALID_DISPUTE_DATA_ERROR, IPFS_GATEWAY } from "consts/index";
import { configureSDK } from "@kleros/kleros-sdk/dataMappings/utils/configureSDK";
import { retrieveRealityData } from "@kleros/kleros-sdk/dataMappings/retrieveRealityData";
import { executeActions } from "@kleros/kleros-sdk/dataMappings/executeActions";
import { populateTemplate } from "@kleros/kleros-sdk/dataMappings/utils/populateTemplate";
import { Answer, DisputeDetails } from "@kleros/kleros-sdk/dataMappings/utils/disputeDetailsTypes";
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
  const [disputeDetails, setDisputeDetails] = useState<DisputeDetails | undefined>(undefined);
  const [disputeTemplateInput, setDisputeTemplateInput] = useState<string>("");
  const [dataMappingsInput, setDataMappingsInput] = useState<string>("");

  // TODO: add some input fields for the IArbitrableV2.DisputeRequest event which is available to the SDK in a real case
  // - arbitrable (= the address which emitted DisputeRequest)
  // - the DisputeRequest event params: arbitrator, arbitrableDisputeID, externalDisputeID, templateId, templateUri
  const arbitrable = "0xdaf749DABE7be6C6894950AE69af35c20a00ABd9";

  useEffect(() => {
    configureSDK({ apiKey: alchemyApiKey });

    if (!disputeTemplateInput || !dataMappingsInput) return;

    const fetchData = async () => {
      let parsedMappings;
      try {
        parsedMappings = JSON.parse(dataMappingsInput);
      } catch (e) {
        console.error(e);
        setDisputeDetails(undefined);
        return;
      }

      try {
        let data = {};
        for (const action of parsedMappings) {
          if (action.type === "reality") {
            const realityData = await retrieveRealityData(action.realityQuestionID, arbitrable);
            data = { ...data, ...realityData };
          } else {
            const results = await executeActions(parsedMappings, arbitrable);
            data = { ...data, ...results };
          }
        }

        console.log("disputeTemplateInput: ", disputeTemplateInput);
        console.log("data: ", data);
        const finalDisputeDetails = populateTemplate(disputeTemplateInput, data);
        setDisputeDetails(finalDisputeDetails);
        console.log("finalTemplate: ", finalDisputeDetails);
      } catch (e) {
        console.error(e);
        setDisputeDetails(undefined);
      }
    };

    fetchData();
  }, [disputeTemplateInput, dataMappingsInput]);

  return (
    <Wrapper>
      <StyledTextArea
        value={disputeTemplateInput}
        onChange={(e) => setDisputeTemplateInput(e.target.value)}
        placeholder="Enter dispute template"
      />
      <StyledTextArea
        value={dataMappingsInput}
        onChange={(e) => setDataMappingsInput(e.target.value)}
        placeholder="Enter data mappings"
      />
      <Overview disputeDetails={disputeDetails} />
    </Wrapper>
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
          <p>Make sure you understand the Policies</p>
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
