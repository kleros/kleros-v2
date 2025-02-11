"use client";
import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";

import Skeleton from "react-loading-skeleton";
import { useDebounce } from "react-use";
import { Mode } from "vanilla-jsoneditor";

import { executeActions } from "@kleros/kleros-sdk/src/dataMappings/executeActions";
import { Answer, DisputeDetails } from "@kleros/kleros-sdk/src/dataMappings/utils/disputeDetailsTypes";
import { populateTemplate } from "@kleros/kleros-sdk/src/dataMappings/utils/populateTemplate";
import { Field } from "@kleros/ui-components-library";

import PolicyIcon from "svgs/icons/policy.svg";

import { DEFAULT_CHAIN } from "consts/chains";
import { INVALID_DISPUTE_DATA_ERROR } from "consts/index";
import { klerosCoreConfig } from "hooks/contracts/generated";
import { getIpfsUrl } from "utils/getIpfsUrl";

import { landscapeStyle } from "styles/landscapeStyle";

import JSONEditor from "components/JSONEditor";
import ReactMarkdown from "components/ReactMarkdown";

import FetchDisputeRequestInput, { DisputeRequest } from "./FetchDisputeRequestInput";
import FetchFromIDInput from "./FetchFromIdInput";
import CustomContextInputs from "./CustomContextInputs";
import { debounceErrorToast } from "utils/debounceErrorToast";
import { isEmpty } from "utils/isEmpty";

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
  background-color: ${({ theme }) => theme.klerosUIComponentsMediumBlue};
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
    fill: ${({ theme }) => theme.klerosUIComponentsPrimaryBlue};
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
  flex-direction: column;
  ${landscapeStyle(
    () => css`
      flex-direction: row;
    `
  )}
`;
const UpperContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  ${landscapeStyle(
    () => css`
      grid-template-columns: 1fr 1fr;
    `
  )}
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
  flex-direction: column;
  ${landscapeStyle(
    () => css`
      flex-direction: row;
      gap: 24px;
    `
  )}
`;

const StyledP = styled.p`
  font-family: "Roboto Mono", monospace;
`;

const StyledHeader = styled.h2`
  margin-top: 24px;
`;

const StyledTitle = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LongText = styled.div`
  display: flex;
  flex-direction: column;
  width: auto;
`;

const DisputeTemplateView = () => {
  const klerosCoreAddress = klerosCoreConfig.address[DEFAULT_CHAIN as keyof typeof klerosCoreConfig.address];
  const [disputeDetails, setDisputeDetails] = useState<DisputeDetails | undefined>(undefined);
  const [disputeTemplateInput, setDisputeTemplateInput] = useState<string>("");
  const [dataMappingsInput, setDataMappingsInput] = useState<string>("");
  const [customContext, setCustomContext] = useState<Record<string, string>>();

  const [params, setParams] = useState<DisputeRequest>({
    _arbitrable: "0x10f7A6f42Af606553883415bc8862643A6e63fdA",
    _arbitrator: klerosCoreAddress as `0x${string}`,
  });
  const [debouncedParams, setDebouncedParams] = useState(params);
  const [loading, setLoading] = useState(false);

  useDebounce(() => setDebouncedParams(params), 350, [params]);

  const handleFormUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = ["_arbitrator", "_arbitrable", "_templateUri"].includes(event.target.name)
      ? event.target.value
      : BigInt(event.target.value);

    setParams({ ...params, [event.target.name]: value });
  };

  useEffect(() => {
    let isFetchDataScheduled = false;

    const scheduleFetchData = () => {
      if (!isFetchDataScheduled) {
        isFetchDataScheduled = true;

        setLoading(true);

        setTimeout(() => {
          let initialContext = {
            arbitrator: debouncedParams._arbitrator,
            arbitrable: debouncedParams._arbitrable,
            arbitratorDisputeID: debouncedParams._arbitratorDisputeID,
            externalDisputeID: debouncedParams._externalDisputeID,
            templateID: debouncedParams._templateId,
            templateUri: debouncedParams._templateUri,
          };

          if (customContext) initialContext = { ...initialContext, ...customContext };

          const fetchData = async () => {
            if (isEmpty(disputeTemplateInput)) return;
            try {
              const data = dataMappingsInput ? await executeActions(JSON.parse(dataMappingsInput), initialContext) : {};
              const finalDisputeDetails = populateTemplate(disputeTemplateInput, data);
              setDisputeDetails(finalDisputeDetails);
            } catch (e: any) {
              console.error(e);
              debounceErrorToast(e?.message);
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

    if (disputeTemplateInput || dataMappingsInput || debouncedParams) {
      scheduleFetchData();
    }
  }, [disputeTemplateInput, dataMappingsInput, debouncedParams, customContext]);

  return (
    <>
      <StyledTitle>
        <h1>Dispute Preview</h1>
      </StyledTitle>
      <UpperContainer>
        <StyledForm>
          <StyledHeader>Dispute Request event parameters</StyledHeader>
          <StyledRow>
            <StyledP>{"arbitrator :"}</StyledP>
            <Field
              type="text"
              name="_arbitrator"
              value={params._arbitrator}
              onChange={handleFormUpdate}
              placeholder="0x..."
            />
          </StyledRow>
          <StyledRow>
            <StyledP>{"arbitrable :"}</StyledP>
            <Field
              type="text"
              name="_arbitrable"
              value={params._arbitrable}
              onChange={handleFormUpdate}
              placeholder="0x..."
            />
          </StyledRow>
          <StyledRow>
            <StyledP>{"arbitratorDisputeID :"}</StyledP>
            <Field
              type="text"
              name="_arbitratorDisputeID"
              value={params._arbitratorDisputeID?.toString()}
              onChange={handleFormUpdate}
              placeholder="0"
            />
          </StyledRow>
          <StyledRow>
            <StyledP>{"externalDisputeID :"}</StyledP>
            <Field
              type="text"
              name="_externalDisputeID"
              value={params._externalDisputeID?.toString()}
              onChange={handleFormUpdate}
              placeholder="0"
            />
          </StyledRow>
          <StyledRow>
            <StyledP>{"templateID :"}</StyledP>
            <Field
              type="text"
              name="_templateId"
              value={params._templateId?.toString()}
              onChange={handleFormUpdate}
              placeholder="0"
            />
          </StyledRow>
          <StyledRow>
            <StyledP>{"templateUri :"}</StyledP>
            <Field
              type="text"
              name="_templateUri"
              value={params._templateUri}
              onChange={handleFormUpdate}
              placeholder="/ipfs/... (optional)"
            />
          </StyledRow>
          <StyledRow>
            <CustomContextInputs dataMapping={dataMappingsInput} setCustomContext={setCustomContext} />
          </StyledRow>
        </StyledForm>
        <div>
          <FetchFromIDInput
            {...{ setDataMappingsInput, setDisputeTemplateInput }}
            defaultTemplateID={debouncedParams._templateId?.toString() ?? ""}
          />
          <FetchDisputeRequestInput setParams={setParams} />
        </div>
      </UpperContainer>

      <LongTextSections>
        <LongText>
          <StyledHeader>Template</StyledHeader>
          <JSONEditor
            content={{ text: disputeTemplateInput }}
            mode={Mode.text}
            onChange={(val: any) => {
              setDisputeTemplateInput(val.text);
            }}
          />
        </LongText>
        <LongText>
          <StyledHeader>Data Mapping</StyledHeader>
          <JSONEditor
            content={{ text: dataMappingsInput }}
            mode={Mode.text}
            onChange={(val: any) => {
              setDataMappingsInput(val.text);
            }}
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
            <StyledA href={getIpfsUrl(disputeDetails?.policyURI)} target="_blank" rel="noreferrer">
              <PolicyIcon />
              Dispute Policy
            </StyledA>
          )}
        </LinkContainer>
      </ShadeArea>
    </Container>
  );
};

export default DisputeTemplateView;
