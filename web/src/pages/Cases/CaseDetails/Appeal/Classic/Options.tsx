import React from "react";
import styled from "styled-components";
import { BigNumber } from "ethers";
import { useParams } from "react-router-dom";
import { useGetMetaEvidence } from "queries/useGetMetaEvidence";
import {
  useClassicAppealQuery,
  ClassicAppealQuery,
} from "queries/useClassicAppealQuery";
import { useAppealCost } from "queries/useAppealCost";
import { useDisputeKitClassicMultipliers } from "queries/useDisputeKitClassicMultipliers";
import OptionCard from "../OptionCard";

const ONE_BASIS_POINT = BigNumber.from("1000");

const Options: React.FC = () => {
  const { id } = useParams();
  const { data } = useClassicAppealQuery(id);
  const paidFees = getPaidFees(data?.dispute);
  const winningChoice = getWinningChoice(data?.dispute);
  const { data: appealCost } = useAppealCost(id);
  const arbitrable = data?.dispute?.arbitrated.id;
  const { data: metaEvidence } = useGetMetaEvidence(id, arbitrable);
  const { data: multipliers } = useDisputeKitClassicMultipliers();
  return (
    <Container>
      <label> Which option do you want to fund? </label>
      <OptionsContainer>
        {typeof paidFees !== "undefined" &&
          typeof multipliers !== "undefined" &&
          metaEvidence?.rulingOptions?.titles?.map(
            (answer: string, i: number) => (
              <OptionCard
                key={answer}
                text={answer}
                winner={(i + 1).toString() === winningChoice}
                funding={
                  paidFees[i + 1]
                    ? paidFees[i + 1]
                    : BigNumber.from("30000000000000000")
                }
                required={
                  (i + 1).toString() === winningChoice
                    ? multipliers?.winner_stake_multiplier
                        .mul(appealCost)
                        .div(ONE_BASIS_POINT)
                    : multipliers?.loser_stake_multiplier
                        .mul(appealCost)
                        .div(ONE_BASIS_POINT)
                }
              />
            )
          )}
      </OptionsContainer>
    </Container>
  );
};

const getCurrentLocalRound = (dispute?: ClassicAppealQuery["dispute"]) => {
  const currentLocalRoundIndex =
    dispute?.disputeKitDispute?.currentLocalRoundIndex;
  return dispute?.disputeKitDispute?.localRounds[currentLocalRoundIndex];
};

const getPaidFees = (dispute?: ClassicAppealQuery["dispute"]) => {
  const currentLocalRound = getCurrentLocalRound(dispute);
  return currentLocalRound?.paidFees;
};

const getWinningChoice = (dispute?: ClassicAppealQuery["dispute"]) => {
  const currentLocalRound = getCurrentLocalRound(dispute);
  return currentLocalRound?.winningChoice;
};

const Container = styled.div`
  margin: 24px 0;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 12px;
`;

export default Options;
