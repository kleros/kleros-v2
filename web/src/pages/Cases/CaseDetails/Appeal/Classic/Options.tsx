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
import StageExplainer from "./StageExplainer";
import OptionCard from "../OptionCard";
import { ONE_BASIS_POINT } from "consts/index";
import { Periods } from "consts/periods";

interface IOptions {
  selectedOption: undefined | number;
  setSelectedOption: (arg0: number) => void;
}

const Options: React.FC<IOptions> = ({ selectedOption, setSelectedOption }) => {
  const { id } = useParams();
  const { data } = useClassicAppealQuery(id);
  const dispute = data?.dispute;
  const paidFees = getPaidFees(data?.dispute);
  const winningChoice = getWinningChoice(data?.dispute);
  const { data: appealCost } = useAppealCost(id);
  const arbitrable = data?.dispute?.arbitrated.id;
  const { data: metaEvidence } = useGetMetaEvidence(id, arbitrable);
  const { data: multipliers } = useDisputeKitClassicMultipliers();
  return dispute && multipliers ? (
    <Container>
      <StageExplainer
        lastPeriodChange={dispute.lastPeriodChange}
        appealPeriodDuration={dispute.court.timesPerPeriod[Periods.appeal]}
        loserTimeMultiplier={multipliers.loser_appeal_period_multiplier.toString()}
      />
      <label> Which option do you want to fund? </label>
      <OptionsContainer>
        <OptionCard
          key={"RefuseToArbitrate"}
          text={"Refuse to arbitrate"}
          selected={0 === selectedOption}
          winner={"0" === winningChoice}
          funding={paidFees ? BigNumber.from(paidFees[0]) : BigNumber.from(0)}
          required={
            "0" === winningChoice
              ? multipliers.winner_stake_multiplier
                  .mul(appealCost)
                  .div(ONE_BASIS_POINT)
              : multipliers.loser_stake_multiplier
                  .mul(appealCost)
                  .div(ONE_BASIS_POINT)
          }
          onClick={() => setSelectedOption(0)}
        />
        {typeof paidFees !== "undefined" &&
          typeof multipliers !== "undefined" &&
          typeof appealCost !== "undefined" &&
          metaEvidence?.rulingOptions?.titles?.map(
            (answer: string, i: number) => (
              <OptionCard
                key={answer}
                text={answer}
                selected={i + 1 === selectedOption}
                winner={(i + 1).toString() === winningChoice}
                funding={
                  paidFees[i + 1]
                    ? BigNumber.from(paidFees[i + 1])
                    : BigNumber.from(0)
                }
                required={
                  (i + 1).toString() === winningChoice
                    ? multipliers.winner_stake_multiplier
                        .mul(appealCost)
                        .div(ONE_BASIS_POINT)
                    : multipliers.loser_stake_multiplier
                        .mul(appealCost)
                        .div(ONE_BASIS_POINT)
                }
                onClick={() => setSelectedOption(i + 1)}
              />
            )
          )}
      </OptionsContainer>
    </Container>
  ) : (
    <></>
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
