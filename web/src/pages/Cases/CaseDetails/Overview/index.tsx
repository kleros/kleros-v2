import React, { useMemo, useState, useEffect } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { formatEther } from "viem";
import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { useDisputeTemplate } from "queries/useDisputeTemplate";
import { useCourtPolicy } from "queries/useCourtPolicy";
import { populateTemplate } from "@kleros/kleros-sdk/src/dataMappings/utils/populateTemplate";
import { executeActions } from "@kleros/kleros-sdk/src/dataMappings/executeActions";
import { configureSDK } from "@kleros/kleros-sdk/src/sdk";
import { alchemyApiKey } from "context/Web3Provider";
import { DisputeDetails } from "@kleros/kleros-sdk/src/dataMappings/utils/disputeDetailsTypes";
import { Periods } from "consts/periods";
import DisputeInfo from "components/DisputeCard/DisputeInfo";
import Verdict from "components/Verdict/index";
import { useVotingHistory } from "hooks/queries/useVotingHistory";
import { getLocalRounds } from "utils/getLocalRounds";
import { DisputeContext } from "components/DisputePreview/DisputeContext";
import { Policies } from "components/DisputePreview/Policies";
import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div`
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  gap: ${responsiveSize(16, 32)};
  padding: ${responsiveSize(16, 32)};
`;

const Divider = styled.hr`
  width: 100%;
  display: flex;
  border: none;
  height: 1px;
  background-color: ${({ theme }) => theme.stroke};
  margin: 0;
`;

interface IOverview {
  arbitrable?: `0x${string}`;
  courtID?: string;
  currentPeriodIndex: number;
}

const Overview: React.FC<IOverview> = ({ arbitrable, courtID, currentPeriodIndex }) => {
  const { id } = useParams();
  const { data: disputeTemplate } = useDisputeTemplate(id, arbitrable);
  const { data: dispute } = useDisputeDetailsQuery(id);
  const { data: courtPolicy } = useCourtPolicy(courtID);
  const { data: votingHistory } = useVotingHistory(id);
  const [disputeDetails, setDisputeDetails] = useState<DisputeDetails | undefined>(undefined);
  const localRounds = getLocalRounds(votingHistory?.dispute?.disputeKitDispute);
  const courtName = courtPolicy?.name;
  const court = dispute?.dispute?.court;
  const rewards = useMemo(() => (court ? `≥ ${formatEther(court.feeForJuror)} ETH` : undefined), [court]);
  const category = disputeTemplate?.category ?? undefined;
  const disputeTemplateInput = disputeTemplate?.templateData;
  const dataMappingsInput = disputeTemplate?.templateDataMappings;

  useEffect(() => {
    configureSDK({ apiKey: alchemyApiKey });
    const initialContext = {
      disputeID: id,
      arbitrable: arbitrable,
    };

    if (!disputeTemplateInput) return;

    const fetchData = async () => {
      try {
        console.log("dataMappingsInput", dataMappingsInput);
        let data = {};
        if (dataMappingsInput) {
          const parsedMappings = JSON.parse(dataMappingsInput);
          console.log("parsedMappings", parsedMappings);
          data = await executeActions(parsedMappings, initialContext);
        }
        console.log("data", data);
        const finalDisputeDetails = populateTemplate(disputeTemplateInput, data);
        setDisputeDetails(finalDisputeDetails);
      } catch (e) {
        console.error(e);
        setDisputeDetails(undefined);
      }
    };

    fetchData();
  }, [disputeTemplateInput, dataMappingsInput, arbitrable, id]);

  return (
    <>
      <Container>
        <DisputeContext disputeDetails={disputeDetails} />
        <Divider />

        {currentPeriodIndex !== Periods.evidence && (
          <>
            <Verdict arbitrable={arbitrable} />
            <Divider />
          </>
        )}

        <DisputeInfo
          isOverview={true}
          overrideIsList={true}
          courtId={court?.id}
          court={courtName}
          round={localRounds?.length}
          {...{ rewards, category }}
        />
      </Container>
      <Policies
        disputePolicyURI={disputeDetails?.policyURI}
        courtId={courtID}
        attachment={disputeDetails?.attachment}
      />
    </>
  );
};

export default Overview;
