import React, { useMemo, createContext, useContext, useState } from "react";

import { useParams } from "react-router-dom";

import { ONE_BASIS_POINT } from "consts/index";
import { Periods } from "consts/periods";
import { usePopulatedDisputeData } from "hooks/queries/usePopulatedDisputeData";
import { useCountdown } from "hooks/useCountdown";
import { getLocalRounds } from "utils/getLocalRounds";
import { isUndefined } from "utils/index";

import { useAppealCost } from "queries/useAppealCost";
import { useClassicAppealQuery, ClassicAppealQuery } from "queries/useClassicAppealQuery";
import { useDisputeKitClassicMultipliers } from "queries/useDisputeKitClassicMultipliers";
import { Answer, DisputeDetails } from "@kleros/kleros-sdk";

type Option = Answer & { paidFee?: string; funded?: boolean };
interface ICountdownContext {
  loserSideCountdown?: number;
  winnerSideCountdown?: number;
  isLoading?: boolean;
}

const CountdownContext = createContext<ICountdownContext>({});

const OptionsContext = createContext<Option[] | undefined>(undefined);

interface ISelectedOptionContext {
  selectedOption: Option | undefined;
  setSelectedOption: (arg0: Option) => void;
}
const SelectedOptionContext = createContext<ISelectedOptionContext>({
  selectedOption: undefined,

  setSelectedOption: () => {},
});

interface IFundingContext {
  winningChoice: string | undefined;
  loserRequiredFunding: bigint | undefined;
  winnerRequiredFunding: bigint | undefined;
  fundedChoices: string[] | undefined;
}

const FundingContext = createContext<IFundingContext>({
  winningChoice: undefined,
  loserRequiredFunding: undefined,
  winnerRequiredFunding: undefined,
  fundedChoices: undefined,
});

export const ClassicAppealProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { id } = useParams();
  const { data } = useClassicAppealQuery(id);
  const dispute = data?.dispute;
  const winningChoice = getWinningChoice(data?.dispute);
  const { data: appealCost } = useAppealCost(id);
  const arbitrable = data?.dispute?.arbitrated.id;
  const { data: disputeDetails } = usePopulatedDisputeData(id, arbitrable as `0x${string}`);
  const { data: multipliers } = useDisputeKitClassicMultipliers();

  const [selectedOption, setSelectedOption] = useState<Option>();

  const options = useMemo(() => getOptions(disputeDetails, data?.dispute), [disputeDetails, data]);

  const loserSideCountdown = useLoserSideCountdown(
    dispute?.lastPeriodChange,
    dispute?.court.timesPerPeriod[Periods.appeal],
    multipliers?.loser_appeal_period_multiplier.toString()
  );

  const winnerSideCountdown = useWinnerSideCountdown(
    dispute?.lastPeriodChange,
    dispute?.court.timesPerPeriod[Periods.appeal]
  );

  const isLoading = useMemo(() => isUndefined(dispute) || isUndefined(multipliers), [dispute, multipliers]);

  const { loserRequiredFunding, winnerRequiredFunding } = useMemo(
    () => ({
      loserRequiredFunding: getRequiredFunding(appealCost, multipliers?.loser_stake_multiplier),
      winnerRequiredFunding: getRequiredFunding(appealCost, multipliers?.winner_stake_multiplier),
    }),
    [appealCost, multipliers]
  );
  const fundedChoices = getFundedChoices(data?.dispute);

  return (
    <CountdownContext.Provider
      value={useMemo(
        () => ({ loserSideCountdown, winnerSideCountdown, isLoading }),
        [loserSideCountdown, winnerSideCountdown, isLoading]
      )}
    >
      <SelectedOptionContext.Provider
        value={useMemo(() => ({ selectedOption, setSelectedOption }), [selectedOption, setSelectedOption])}
      >
        <FundingContext.Provider
          value={useMemo(
            () => ({
              winningChoice,
              loserRequiredFunding,
              winnerRequiredFunding,
              fundedChoices,
            }),
            [winningChoice, loserRequiredFunding, winnerRequiredFunding, fundedChoices]
          )}
        >
          <OptionsContext.Provider value={options}>{children}</OptionsContext.Provider>
        </FundingContext.Provider>
      </SelectedOptionContext.Provider>
    </CountdownContext.Provider>
  );
};

export const useCountdownContext = () => useContext(CountdownContext);
export const useSelectedOptionContext = () => useContext(SelectedOptionContext);
export const useFundingContext = () => useContext(FundingContext);
export const useOptionsContext = () => useContext(OptionsContext);

const getCurrentLocalRound = (dispute?: ClassicAppealQuery["dispute"]) => {
  if (!dispute) return undefined;

  const period = dispute.period;
  const currentLocalRoundIndex = dispute.disputeKitDispute.at(-1)?.currentLocalRoundIndex;
  const adjustedRoundIndex = ["appeal", "execution"].includes(period)
    ? currentLocalRoundIndex
    : currentLocalRoundIndex - 1;

  return getLocalRounds(dispute.disputeKitDispute)[adjustedRoundIndex];
};

const getOptions = (dispute?: DisputeDetails, classicDispute?: ClassicAppealQuery["dispute"]) => {
  if (!dispute) return [];
  const currentLocalRound = getCurrentLocalRound(classicDispute);
  const classicAnswers = currentLocalRound?.answers;

  const options = dispute.answers.map((answer) => {
    const classicAnswer = classicAnswers?.find((classicAnswer) => BigInt(classicAnswer.answerId) == BigInt(answer.id));
    // converting hexadecimal id to stringified bigint to match id fomr subgraph
    return {
      ...answer,
      id: BigInt(answer.id).toString(),
      paidFee: classicAnswer?.paidFee ?? "0",
      funded: classicAnswer?.funded ?? false,
    };
  });
  return options;
};

const getFundedChoices = (dispute?: ClassicAppealQuery["dispute"]) => {
  const currentLocalRound = getCurrentLocalRound(dispute);
  return currentLocalRound?.fundedChoices;
};

const getWinningChoice = (dispute?: ClassicAppealQuery["dispute"]) => {
  const currentLocalRound = getCurrentLocalRound(dispute);
  return currentLocalRound?.winningChoice;
};

export const getRequiredFunding = (appealCost = 0n, stake_multiplier = 0n): bigint =>
  appealCost + (stake_multiplier * appealCost) / ONE_BASIS_POINT;

function useLoserSideCountdown(lastPeriodChange = "0", appealPeriodDuration = "0", loserTimeMultiplier = "0") {
  const deadline = useMemo(
    () => getDeadline(lastPeriodChange, appealPeriodDuration, loserTimeMultiplier),
    [lastPeriodChange, appealPeriodDuration, loserTimeMultiplier]
  );
  return useCountdown(deadline);
}

function useWinnerSideCountdown(lastPeriodChange = "0", appealPeriodDuration = "0") {
  const deadline = useMemo(
    () => Number(BigInt(lastPeriodChange) + BigInt(appealPeriodDuration)),
    [lastPeriodChange, appealPeriodDuration]
  );
  return useCountdown(deadline);
}

const getDeadline = (lastPeriodChange: string, appealPeriodDuration: string, loserTimeMultiplier: string): number => {
  const parsedLastPeriodChange = BigInt(lastPeriodChange);
  const parsedAppealPeriodDuration = BigInt(appealPeriodDuration);
  const parsedLoserTimeMultiplier = BigInt(loserTimeMultiplier);
  const loserAppealPeriodDuration = (parsedAppealPeriodDuration * parsedLoserTimeMultiplier) / ONE_BASIS_POINT;
  return Number(loserAppealPeriodDuration + parsedLastPeriodChange);
};
