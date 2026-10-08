import React, { useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "react-use";
import type { Address } from "viem";

import { Button, CustomRadio } from "@kleros/ui-components-library";

import { AliasArray, Answer, useNewDisputeContext } from "context/NewDisputeContext";
import { extraDataToTokenInfo } from "utils/extradataToTokenInfo";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { usePopulatedDisputeData } from "queries/usePopulatedDisputeData";
import { useRoundDetailsQuery } from "queries/useRoundDetailsQuery";

import { DisputeKits } from "src/dispute-kits";
import { isUndefined } from "src/utils";

import Header from "../Header";

import CreationCard, { CreationMethod } from "./CreationCard";

const Landing: React.FC = () => {
  const { t } = useTranslation();
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
  } = usePopulatedDisputeData(debouncedDisputeID, dispute?.dispute?.arbitrated.id as Address);

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
      numberOfJurors: roundData.round?.nbVotes ? Number.parseInt(roundData.round.nbVotes, 10) : undefined,
      disputeKitId: Number.parseInt(roundData.round?.disputeKit.id ?? DisputeKits.Classic.toString(), 10),
      answers,
      aliasesArray: aliasesArray ?? disputeData.aliasesArray,
      disputeKitData: gatedTokenInfo ? { ...gatedTokenInfo, isValid: true } : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [populatedDispute, roundData, isInvalidDispute]);

  return (
    <div className="flex flex-col items-center w-[84vw] lg:w-[calc(442px_+_(700_-_442)_*_(min(max(100vw,_900px),_1250px)_-_900px)_/_(350))] lg:pb-60">
      <Header text={t("headers.create_a_case")} />
      <CustomRadio
        aria-label={t("headers.create_a_case")}
        value={String(creationMethod)}
        onChange={(value) => setCreationMethod(Number(value) as CreationMethod)}
        className="w-full max-w-[720px] flex flex-col gap-4 mb-8"
      >
        <CreationCard
          cardMethod={CreationMethod.Scratch}
          selectedMethod={creationMethod}
          {...{ disputeID, setDisputeID, isInvalidDispute }}
        />
        <CreationCard
          cardMethod={CreationMethod.Duplicate}
          selectedMethod={creationMethod}
          {...{ disputeID, setDisputeID, isInvalidDispute }}
        />
      </CustomRadio>

      <Button
        text={t("buttons.next")}
        isLoading={isLoading}
        isDisabled={
          isLoading ||
          isInvalidDispute ||
          (creationMethod === CreationMethod.Duplicate && isUndefined(debouncedDisputeID))
        }
        onPress={() => navigate("/resolver/title")}
      />
    </div>
  );
};

export default Landing;
