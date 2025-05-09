import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";

import { useNavigate } from "react-router-dom";
import { useDebounce } from "react-use";

import { Button } from "@kleros/ui-components-library";

import { AliasArray, Answer, useNewDisputeContext } from "context/NewDisputeContext";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { usePopulatedDisputeData } from "queries/usePopulatedDisputeData";
import { useRoundDetailsQuery } from "queries/useRoundDetailsQuery";

import { isUndefined } from "src/utils";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { Divider } from "components/Divider";
import LabeledInput from "components/LabeledInput";

import Header from "./Header";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  width: 84vw;

  ${landscapeStyle(
    () => css`
      width: ${responsiveSize(442, 700, 900)};

      padding-bottom: 240px;
      gap: 48px;
    `
  )}
`;

const ErrorMsg = styled.small`
  font-size: 16px;
  color: ${({ theme }) => theme.error};
`;

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const [disputeID, setDisputeID] = useState<string>();
  const [debouncedDisputeID, setDebouncedDisputeID] = useState<string>();
  const { disputeData, setDisputeData } = useNewDisputeContext();
  useDebounce(() => setDebouncedDisputeID(disputeID), 500, [disputeID]);

  const { data: dispute } = useDisputeDetailsQuery(debouncedDisputeID);
  const {
    data: populatedDispute,
    isError: isErrorPopulatedDisputeQuery,
    isLoading,
  } = usePopulatedDisputeData(debouncedDisputeID, dispute?.dispute?.arbitrated.id as `0x${string}`);

  // we want the genesis round's court and numberOfJurors
  const { data: roundData, isError: isErrorRoundQuery } = useRoundDetailsQuery(debouncedDisputeID, 0);

  const isInvalidDispute =
    !isLoading &&
    !isUndefined(populatedDispute) &&
    (isErrorRoundQuery || isErrorPopulatedDisputeQuery || Object.keys(populatedDispute).length === 0);

  useEffect(() => {
    if (isUndefined(populatedDispute) || isUndefined(roundData) || isInvalidDispute) return;

    const answers = populatedDispute.answers.reduce<Answer[]>((acc, val) => {
      acc.push({ ...val, id: parseInt(val.id, 16).toString() });
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
      answers,
      aliasesArray,
    });
  }, [populatedDispute, roundData, isInvalidDispute]);

  const showContinueButton =
    !isUndefined(disputeData) && !isUndefined(populatedDispute) && !isInvalidDispute && !isUndefined(roundData);
  return (
    <Container>
      <Header text="Create a case" />
      <Button text="Create from Scratch" onClick={() => navigate("/resolver/title")} />

      <Divider />
      <LabeledInput
        value={disputeID}
        onChange={(e) => setDisputeID(e.target.value)}
        placeholder="Dispute ID"
        label="Duplicate an exiting case."
        type="number"
        onInput={(e) => {
          const value = e.currentTarget.value.replace(/\D/g, "");

          e.currentTarget.value = value;
          return e;
        }}
      />
      {isInvalidDispute ? <ErrorMsg>Error loading dispute data. Please use another dispute.</ErrorMsg> : null}
      {showContinueButton ? <Button small text="Continue" onClick={() => navigate("/resolver/title")} /> : null}
    </Container>
  );
};

export default Landing;
