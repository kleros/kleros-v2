import React, { useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";

import { useNavigate } from "react-router-dom";
import { useDebounce } from "react-use";

import { Button } from "@kleros/ui-components-library";

import { AliasArray, Answer, useNewDisputeContext } from "context/NewDisputeContext";
import { extraDataToTokenInfo } from "utils/extradataToTokenInfo";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { usePopulatedDisputeData } from "queries/usePopulatedDisputeData";
import { useRoundDetailsQuery } from "queries/useRoundDetailsQuery";

import { isUndefined } from "src/utils";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import Header from "../Header";

import CreationCard, { CreationMethod } from "./CreationCard";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 84vw;

  ${landscapeStyle(
    () => css`
      width: ${responsiveSize(442, 700, 900)};

      padding-bottom: 240px;
    `
  )}
`;

const CardContainer = styled.div`
  width: 100%;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
`;

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [creationMethod, setCreationMethod] = useState<CreationMethod>(CreationMethod.Scratch);

  const [disputeID, setDisputeID] = useState<string>();
  const [debouncedDisputeID, setDebouncedDisputeID] = useState<string>();
  const { disputeData, setDisputeData } = useNewDisputeContext();
  useDebounce(() => setDebouncedDisputeID(disputeID), 500, [disputeID]);

  const { data: dispute, isLoading: isLoadingDispute } = useDisputeDetailsQuery(debouncedDisputeID);
  const {
    data: populatedDispute,
    isError: isErrorPopulatedDisputeQuery,
    isLoading: isPopulatingDispute,
  } = usePopulatedDisputeData(debouncedDisputeID, dispute?.dispute?.arbitrated.id as `0x${string}`);

  // we want the genesis round's court and numberOfJurors
  const {
    data: roundData,
    isError: isErrorRoundQuery,
    isLoading: isLoadingRound,
  } = useRoundDetailsQuery(debouncedDisputeID, 0);

  const gatedTokenInfo = useMemo(() => {
    const extradata = roundData?.round?.dispute.disputeKitDispute?.[0].extraData;

    if (isUndefined(extradata)) return;
    return extraDataToTokenInfo(extradata);
  }, [roundData]);

  const isLoading = useMemo(
    () => isLoadingDispute || isPopulatingDispute || isLoadingRound,
    [isLoadingDispute, isPopulatingDispute, isLoadingRound]
  );

  const isInvalidDispute = useMemo(() => {
    if (isUndefined(debouncedDisputeID) || isLoading) return false;
    if (dispute?.dispute === null) return true;
    if (!isUndefined(populatedDispute)) {
      return isErrorRoundQuery || isErrorPopulatedDisputeQuery || Object.keys(populatedDispute).length === 0;
    }
    return false;
  }, [debouncedDisputeID, isLoading, populatedDispute, isErrorRoundQuery, isErrorPopulatedDisputeQuery, dispute]);

  useEffect(() => {
    if (isUndefined(populatedDispute) || isUndefined(roundData) || isInvalidDispute) return;

    const answers = populatedDispute.answers.reduce<Answer[]>((acc, val) => {
      const id = parseInt(val.id, 16);
      // don't duplicate RFA option
      if (id === 0) return acc;
      acc.push({ ...val, id: id.toString() });
      return acc;
    }, []);

    let aliasesArray: AliasArray[] | undefined;
    if (!isUndefined(populatedDispute.aliases)) {
      aliasesArray = Object.entries(populatedDispute.aliases).map(([key, value], index) => ({
        name: key,
        address: value,
        id: (index + 1).toString(),
      }));
    }

    setDisputeData({
      ...disputeData,
      title: populatedDispute.title,
      description: populatedDispute.description,
      category: populatedDispute.category,
      policyURI: populatedDispute.policyURI,
      question: populatedDispute.question,
      courtId: roundData.round?.court.id,
      numberOfJurors: roundData.round?.nbVotes,
      disputeKitId: parseInt(roundData.round?.disputeKit.id ?? "1", 10),
      answers,
      aliasesArray: aliasesArray ?? disputeData.aliasesArray,
      disputeKitData: gatedTokenInfo ? { ...gatedTokenInfo, type: "gated" } : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [populatedDispute, roundData, isInvalidDispute]);

  return (
    <Container>
      <Header text="Create a case" />
      <CardContainer>
        <CreationCard
          cardMethod={CreationMethod.Scratch}
          selectedMethod={creationMethod}
          {...{ disputeID, setDisputeID, setCreationMethod, isInvalidDispute }}
        />
        <CreationCard
          cardMethod={CreationMethod.Duplicate}
          selectedMethod={creationMethod}
          {...{ disputeID, setDisputeID, setCreationMethod, isInvalidDispute }}
        />
      </CardContainer>

      <Button
        text="Next"
        isLoading={isLoading}
        disabled={
          isLoading ||
          isInvalidDispute ||
          (creationMethod === CreationMethod.Duplicate && isUndefined(debouncedDisputeID))
        }
        onClick={() => navigate("/resolver/title")}
      />
    </Container>
  );
};

export default Landing;
