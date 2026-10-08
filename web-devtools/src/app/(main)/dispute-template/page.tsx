"use client";
import React, { useEffect, useState } from "react";

import Skeleton from "react-loading-skeleton";
import { useDebounce } from "react-use";
import { Mode } from "vanilla-jsoneditor";

import { executeActions } from "@kleros/kleros-sdk/src/dataMappings/executeActions";
import { Answer, DisputeDetails } from "@kleros/kleros-sdk/src/dataMappings/utils/disputeDetailsTypes";
import { populateTemplate } from "@kleros/kleros-sdk/src/dataMappings/utils/populateTemplate";
import { TextField } from "@kleros/ui-components-library";

import PolicyIcon from "svgs/icons/policy.svg";

import { DEFAULT_CHAIN } from "consts/chains";
import { INVALID_DISPUTE_DATA_ERROR } from "consts/index";
import { klerosCoreConfig } from "hooks/contracts/generated";
import { debounceErrorToast } from "utils/debounceErrorToast";
import { getIpfsUrl } from "utils/getIpfsUrl";
import { isEmpty } from "utils/isEmpty";

import JSONEditor from "components/JSONEditor";
import ReactMarkdown from "components/ReactMarkdown";

import CustomContextInputs from "./CustomContextInputs";
import FetchDisputeRequestInput, { DisputeRequest } from "./FetchDisputeRequestInput";
import FetchFromIDInput from "./FetchFromIdInput";

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

  const handleFormUpdate = (name: keyof DisputeRequest, input: string) => {
    const value = ["_arbitrator", "_arbitrable", "_templateUri"].includes(name) ? input : BigInt(input);
    setParams((previous) => ({ ...previous, [name]: value }));
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
            templateID: debouncedParams._templateId,
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
      <div className="mt-4 flex items-center justify-center">
        <h1>Dispute Preview</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <form className="ml-6 mt-6 flex flex-col justify-center">
          <h2 className="mt-6">Dispute Request event parameters</h2>
          <div className="flex flex-col lg:flex-row lg:gap-6">
            <p className="font-['Roboto_Mono',monospace]">{"arbitrator :"}</p>
            <TextField
              type="text"
              inputProps={{ className: "[font-family:Arial] text-[13.3333px] [line-height:normal]" }}
              aria-label="arbitrator"
              name="_arbitrator"
              value={params._arbitrator}
              onChange={(value) => handleFormUpdate("_arbitrator", value)}
              placeholder="0x..."
            />
          </div>
          <div className="flex flex-col lg:flex-row lg:gap-6">
            <p className="font-['Roboto_Mono',monospace]">{"arbitrable :"}</p>
            <TextField
              type="text"
              inputProps={{ className: "[font-family:Arial] text-[13.3333px] [line-height:normal]" }}
              aria-label="arbitrable"
              name="_arbitrable"
              value={params._arbitrable}
              onChange={(value) => handleFormUpdate("_arbitrable", value)}
              placeholder="0x..."
            />
          </div>
          <div className="flex flex-col lg:flex-row lg:gap-6">
            <p className="font-['Roboto_Mono',monospace]">{"arbitratorDisputeID :"}</p>
            <TextField
              type="text"
              inputProps={{ className: "[font-family:Arial] text-[13.3333px] [line-height:normal]" }}
              aria-label="arbitratorDisputeID"
              name="_arbitratorDisputeID"
              value={params._arbitratorDisputeID?.toString()}
              onChange={(value) => handleFormUpdate("_arbitratorDisputeID", value)}
              placeholder="0"
            />
          </div>
          <div className="flex flex-col lg:flex-row lg:gap-6">
            <p className="font-['Roboto_Mono',monospace]">{"templateID :"}</p>
            <TextField
              type="text"
              inputProps={{ className: "[font-family:Arial] text-[13.3333px] [line-height:normal]" }}
              aria-label="templateId"
              name="_templateId"
              value={params._templateId?.toString()}
              onChange={(value) => handleFormUpdate("_templateId", value)}
              placeholder="0"
            />
          </div>
          <div className="flex flex-col lg:flex-row lg:gap-6">
            <CustomContextInputs dataMapping={dataMappingsInput} setCustomContext={setCustomContext} />
          </div>
        </form>
        <div>
          <FetchFromIDInput
            {...{ setDataMappingsInput, setDisputeTemplateInput }}
            defaultTemplateID={debouncedParams._templateId?.toString() ?? ""}
          />
          <FetchDisputeRequestInput setParams={setParams} />
        </div>
      </div>

      <div className="m-6 flex min-h-[calc(100vh-144px)] flex-col gap-3 lg:flex-row">
        <div className="flex w-auto flex-col">
          <h2 className="mt-6">Template</h2>
          <JSONEditor
            content={{ text: disputeTemplateInput }}
            mode={Mode.text}
            onChange={(val: any) => {
              setDisputeTemplateInput(val.text);
            }}
          />
        </div>
        <div className="flex w-auto flex-col">
          <h2 className="mt-6">Data Mapping</h2>
          <JSONEditor
            content={{ text: dataMappingsInput }}
            mode={Mode.text}
            onChange={(val: any) => {
              setDataMappingsInput(val.text);
            }}
          />
        </div>
        <div className="flex w-auto flex-col">
          <h2 className="mt-6">Dispute Preview</h2>
          <br />
          {loading ? <Skeleton /> : <Overview disputeDetails={disputeDetails} />}
        </div>
      </div>
    </>
  );
};

const Overview: React.FC<{ disputeDetails: DisputeDetails | undefined }> = ({ disputeDetails }) => {
  return (
    <div className="flex h-auto flex-col gap-4 [&>h1]:m-0 [&>hr]:w-full">
      <h1>{disputeDetails?.title ?? INVALID_DISPUTE_DATA_ERROR}</h1>
      <div className="flex flex-col [&>*]:m-0">
        <ReactMarkdown>{disputeDetails?.question ?? INVALID_DISPUTE_DATA_ERROR}</ReactMarkdown>
        <ReactMarkdown>{disputeDetails?.description ?? INVALID_DISPUTE_DATA_ERROR}</ReactMarkdown>
      </div>
      {disputeDetails?.frontendUrl && (
        <a href={disputeDetails?.frontendUrl} target="_blank" rel="noreferrer">
          Go to arbitrable
        </a>
      )}
      <div className="flex flex-col [&>*]:m-0 [&>span]:flex [&>span]:gap-2">
        {disputeDetails && <h3>Voting Options</h3>}
        {disputeDetails?.answers?.map((answer: Answer, i: number) => (
          <span key={answer.id}>
            <small>Option {i + 1}:</small>
            <label>{answer.title}. </label>
            <label>{answer.description}</label>
          </span>
        ))}
      </div>
      <div className="mt-4 w-full bg-klerosUIComponentsMediumBlue p-4 [&>p]:mt-0">
        <p>Make sure you read and understand the Policies</p>
        <div className="flex justify-between">
          {disputeDetails?.policyURI && (
            <a
              className="flex items-center gap-1 [&>svg]:w-4 [&>svg]:fill-klerosUIComponentsPrimaryBlue"
              href={getIpfsUrl(disputeDetails?.policyURI)}
              target="_blank"
              rel="noreferrer"
            >
              <PolicyIcon />
              Dispute Policy
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisputeTemplateView;
