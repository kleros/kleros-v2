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
import { useKlerosCoreAddress } from "hooks/useContractAddress";
import { alchemyApiKey } from "context/Web3Provider";
import { useDebounce } from "react-use";
import Skeleton from "react-loading-skeleton";

const Container = styled.div`
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
  font-family: "Roboto Mono", monospace;
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
  font-family: "Roboto Mono", monospace;
`;

const StyledHeader = styled.h2`
  margin-top 24px;
`;

const LongText = styled.div`
  display: flex;
  flex-direction: column;
  width: auto;
`;

const DisputeTemplateView = () => {
  const klerosCoreAddress = useKlerosCoreAddress();
  const [disputeDetails, setDisputeDetails] = useState<DisputeDetails | undefined>(undefined);
  const [disputeTemplateInput, setDisputeTemplateInput] = useState<string>("");
  const [dataMappingsInput, setDataMappingsInput] = useState<string>("");
  const [arbitrator, setArbitrator] = useState(klerosCoreAddress as string);
  const [arbitrable, setArbitrable] = useState("0x10f7A6f42Af606553883415bc8862643A6e63fdA"); // Escrow devnet
  const [arbitrableDisputeID, setArbitrableDisputeID] = useState("0");
  const [externalDisputeID, setExternalDisputeID] = useState("0");
  const [templateID, setTemplateID] = useState("0");
  const [templateUri, setTemplateUri] = useState("");

  const [debouncedArbitrator, setDebouncedArbitrator] = useState(arbitrator);
  const [debouncedArbitrable, setDebouncedArbitrable] = useState(arbitrable);
  const [debouncedArbitrableDisputeID, setDebouncedArbitrableDisputeID] = useState(arbitrableDisputeID);
  const [debouncedExternalDisputeID, setDebouncedExternalDisputeID] = useState(externalDisputeID);
  const [debouncedTemplateID, setDebouncedTemplateID] = useState(templateID);
  const [debouncedTemplateUri, setDebouncedTemplateUri] = useState(templateUri);
  const [loading, setLoading] = useState(false);

  useDebounce(() => setDebouncedArbitrator(arbitrator), 350, [arbitrator]);
  useDebounce(() => setDebouncedArbitrable(arbitrable), 350, [arbitrable]);
  useDebounce(() => setDebouncedArbitrableDisputeID(arbitrableDisputeID), 350, [arbitrableDisputeID]);
  useDebounce(() => setDebouncedExternalDisputeID(externalDisputeID), 350, [externalDisputeID]);
  useDebounce(() => setDebouncedTemplateID(templateID), 350, [templateID]);
  useDebounce(() => setDebouncedTemplateUri(templateUri), 350, [templateUri]);

  useEffect(() => {
    configureSDK({ apiKey: alchemyApiKey });

    let isFetchDataScheduled = false;

    const scheduleFetchData = () => {
      if (!isFetchDataScheduled) {
        isFetchDataScheduled = true;

        setLoading(true);

        setTimeout(() => {
          const initialContext = {
            arbitrator: debouncedArbitrator,
            arbitrable: debouncedArbitrable,
            arbitrableDisputeID: debouncedArbitrableDisputeID,
            externalDisputeID: debouncedExternalDisputeID,
            templateID: debouncedTemplateID,
            templateUri: debouncedTemplateUri,
          };

          const fetchData = async () => {
            try {
              const parsedMappings = JSON.parse(dataMappingsInput);
              const data = await executeActions(parsedMappings, initialContext);
              const finalDisputeDetails = populateTemplate(disputeTemplateInput, data);
              setDisputeDetails(finalDisputeDetails);
            } catch (e) {
              console.error(e);
              setDisputeDetails(undefined);
            } finally {
              setLoading(false);
            }
          };

          fetchData();

          isFetchDataScheduled = false;
        }, 350);
      }
    };

    if (
      disputeTemplateInput ||
      dataMappingsInput ||
      debouncedArbitrator ||
      debouncedArbitrable ||
      debouncedArbitrableDisputeID ||
      debouncedExternalDisputeID ||
      debouncedTemplateID ||
      debouncedTemplateUri
    ) {
      scheduleFetchData();
    }
  }, [
    disputeTemplateInput,
    dataMappingsInput,
    debouncedArbitrator,
    debouncedArbitrable,
    debouncedArbitrableDisputeID,
    debouncedExternalDisputeID,
    debouncedTemplateID,
    debouncedTemplateUri,
  ]);
  return (
    <>
      <StyledForm>
        <StyledHeader>Dispute Request event parameters</StyledHeader>
        <StyledRow>
          <StyledP>{"{{ arbitrator }}"}</StyledP>
          <Field type="text" value={arbitrator} onChange={(e) => setArbitrator(e.target.value)} placeholder="0x..." />
        </StyledRow>
        <StyledRow>
          <StyledP>{"{{ arbitrable }}"}</StyledP>
          <Field type="text" value={arbitrable} onChange={(e) => setArbitrable(e.target.value)} placeholder="0x..." />
        </StyledRow>
        <StyledRow>
          <StyledP>{"{{ arbitrableDisputeID }}"}</StyledP>
          <Field
            type="text"
            value={arbitrableDisputeID}
            onChange={(e) => setArbitrableDisputeID(e.target.value)}
            placeholder="0"
          />
        </StyledRow>
        <StyledRow>
          <StyledP>{"{{ externalDisputeID }}"}</StyledP>
          <Field
            type="text"
            value={externalDisputeID}
            onChange={(e) => setExternalDisputeID(e.target.value)}
            placeholder="0"
          />
        </StyledRow>
        <StyledRow>
          <StyledP>{"{{ templateID }}"}</StyledP>
          <Field type="text" value={templateID} onChange={(e) => setTemplateID(e.target.value)} placeholder="0" />
        </StyledRow>
        <StyledRow>
          <StyledP>{"{{ templateUri }}"}</StyledP>
          <Field
            type="text"
            value={templateUri}
            onChange={(e) => setTemplateUri(e.target.value)}
            placeholder="ipfs://... (optional)"
          />
        </StyledRow>
      </StyledForm>
      <LongTextSections>
        <LongText>
          <StyledHeader>Template</StyledHeader>
          <StyledTextArea
            value={disputeTemplateInput}
            onChange={(e) => setDisputeTemplateInput(e.target.value)}
            placeholder="Enter dispute template"
          />
        </LongText>
        <LongText>
          <StyledHeader>Data Mapping</StyledHeader>
          <StyledTextArea
            value={dataMappingsInput}
            onChange={(e) => setDataMappingsInput(e.target.value)}
            placeholder="Enter data mappings"
          />
        </LongText>
        <LongText>
          <StyledHeader>Dispute Preview</StyledHeader>
          <br />
          {loading ? <Skeleton /> : <Overview disputeDetails={disputeDetails} />}
        </LongText>
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
