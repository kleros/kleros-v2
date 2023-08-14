import React, { useMemo, useState, createContext, useContext } from "react";
import { useParams } from "react-router-dom";
import { ONE_BASIS_POINT } from "consts/index";
import { Periods } from "consts/periods";
import { isUndefined } from "utils/index";
import { useDisputeTemplate } from "queries/useDisputeTemplate";
import { useAppealCost } from "queries/useAppealCost";
import { useDisputeKitClassicMultipliers } from "queries/useDisputeKitClassicMultipliers";
import { useClassicAppealQuery, ClassicAppealQuery } from "queries/useClassicAppealQuery";
import { useCountdown } from "hooks/useCountdown";

const LoserSideCountdownContext = createContext<number | undefined>(undefined);

const OptionsContext = createContext<string[] | undefined>(undefined);

interface ISelectedOptionContext {
  selectedOption: number | undefined;
  setSelectedOption: (arg0: number) => void;
}
const SelectedOptionContext = createContext<ISelectedOptionContext>({
  selectedOption: undefined,
  //eslint-disable-next-line @typescript-eslint/no-empty-function
  setSelectedOption: () => {},
});

interface IFundingContext {
  winningChoice: string | undefined;
  paidFees: bigint[] | undefined;
  loserRequiredFunding: bigint | undefined;
  winnerRequiredFunding: bigint | undefined;
  fundedChoices: string[] | undefined;
}
const FundingContext = createContext<IFundingContext>({
  winningChoice: undefined,
  paidFees: undefined,
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
  const paidFees = getPaidFees(data?.dispute);
  const winningChoice = getWinningChoice(data?.dispute);
  const { data: appealCost } = useAppealCost(id);
  const arbitrable = data?.dispute?.arbitrated.id;
  const { data: disputeTemplate } = useDisputeTemplate(id, arbitrable);
  const { data: multipliers } = useDisputeKitClassicMultipliers();
  const options = ["Refuse to Arbitrate"].concat(
    disputeTemplate?.answers?.map((answer: { title: string; description: string }) => {
      return answer.title;
    })
  );
  const loserSideCountdown = useLoserSideCountdown(
    dispute?.lastPeriodChange,
    dispute?.court.timesPerPeriod[Periods.appeal],
    multipliers?.loser_appeal_period_multiplier.toString()!
  );
  const loserRequiredFunding = getLoserRequiredFunding(appealCost!, multipliers?.loser_stake_multiplier!);
  const winnerRequiredFunding = getWinnerRequiredFunding(appealCost!, multipliers?.winner_stake_multiplier!);
  const fundedChoices = getFundedChoices(data?.dispute);
  const [selectedOption, setSelectedOption] = useState<number | undefined>();
  return (
    <LoserSideCountdownContext.Provider value={loserSideCountdown}>
      <SelectedOptionContext.Provider
        value={useMemo(() => ({ selectedOption, setSelectedOption }), [selectedOption, setSelectedOption])}
      >
        <FundingContext.Provider
          value={useMemo(
            () => ({
              winningChoice,
              paidFees,
              loserRequiredFunding,
              winnerRequiredFunding,
              fundedChoices,
            }),
            [winningChoice, paidFees, loserRequiredFunding, winnerRequiredFunding, fundedChoices]
          )}
        >
          <OptionsContext.Provider value={options}>{children}</OptionsContext.Provider>
        </FundingContext.Provider>
      </SelectedOptionContext.Provider>
    </LoserSideCountdownContext.Provider>
  );
};

export const useLoserSideCountdownContext = () => useContext(LoserSideCountdownContext);
export const useSelectedOptionContext = () => useContext(SelectedOptionContext);
export const useFundingContext = () => useContext(FundingContext);
export const useOptionsContext = () => useContext(OptionsContext);

const getCurrentLocalRound = (dispute?: ClassicAppealQuery["dispute"]) => {
  const currentLocalRoundIndex = dispute?.disputeKitDispute?.currentLocalRoundIndex;
  return dispute?.disputeKitDispute?.localRounds[currentLocalRoundIndex];
};

const getPaidFees = (dispute?: ClassicAppealQuery["dispute"]) => {
  const currentLocalRound = getCurrentLocalRound(dispute);
  return currentLocalRound?.paidFees.map((amount) => BigInt(amount));
};

const getFundedChoices = (dispute?: ClassicAppealQuery["dispute"]) => {
  const currentLocalRound = getCurrentLocalRound(dispute);
  return currentLocalRound?.fundedChoices;
};

const getWinningChoice = (dispute?: ClassicAppealQuery["dispute"]) => {
  const currentLocalRound = getCurrentLocalRound(dispute);
  return currentLocalRound?.winningChoice;
};

export const getLoserRequiredFunding = (appealCost: bigint, loser_stake_multiplier: bigint): bigint =>
  !isUndefined(appealCost) && !isUndefined(loser_stake_multiplier)
    ? appealCost + (loser_stake_multiplier * appealCost) / ONE_BASIS_POINT
    : 0n;

export const getWinnerRequiredFunding = (appealCost: bigint, winner_stake_multiplier: bigint): bigint =>
  !isUndefined(appealCost) && !isUndefined(winner_stake_multiplier)
    ? appealCost + (winner_stake_multiplier * appealCost) / ONE_BASIS_POINT
    : 0n;

const getDeadline = (lastPeriodChange: string, appealPeriodDuration: string, loserTimeMultiplier: string): number => {
  const parsedLastPeriodChange = BigInt(lastPeriodChange);
  const parsedAppealPeriodDuration = BigInt(appealPeriodDuration);
  const parsedLoserTimeMultiplier = BigInt(loserTimeMultiplier);
  const loserAppealPeriodDuration = (parsedAppealPeriodDuration * parsedLoserTimeMultiplier) / ONE_BASIS_POINT;
  return Number(loserAppealPeriodDuration + parsedLastPeriodChange);
};

function useLoserSideCountdown(lastPeriodChange: string, appealPeriodDuration: string, loserTimeMultiplier: string) {
  const deadline = useMemo(
    () =>
      !isUndefined(lastPeriodChange) && !isUndefined(appealPeriodDuration) && !isUndefined(loserTimeMultiplier)
        ? getDeadline(lastPeriodChange, appealPeriodDuration, loserTimeMultiplier)
        : 0,
    [lastPeriodChange, appealPeriodDuration, loserTimeMultiplier]
  );
  return useCountdown(deadline);
}
