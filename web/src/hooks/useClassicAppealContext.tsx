import React, { useMemo, useState, createContext, useContext } from "react";
import { useParams } from "react-router-dom";
import { ONE_BASIS_POINT } from "consts/index";
import { Periods } from "consts/periods";
import { useDisputeTemplate } from "queries/useDisputeTemplate";
import { useAppealCost } from "queries/useAppealCost";
import { useDisputeKitClassicMultipliers } from "queries/useDisputeKitClassicMultipliers";
import { useClassicAppealQuery, ClassicAppealQuery } from "queries/useClassicAppealQuery";
import { useCountdown } from "hooks/useCountdown";
import { getLocalRounds } from "utils/getLocalRounds";

interface ICountdownContext {
  loserSideCountdown?: number;
  winnerSideCountdown?: number;
}
const CountdownContext = createContext<ICountdownContext>({});

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
    multipliers?.loser_appeal_period_multiplier.toString()
  );

  const winnerSideCountdown = useWinnerSideCountdown(
    dispute?.lastPeriodChange,
    dispute?.court.timesPerPeriod[Periods.appeal]
  );

  const { loserRequiredFunding, winnerRequiredFunding } = useMemo(
    () => ({
      loserRequiredFunding: getRequiredFunding(appealCost, multipliers?.loser_stake_multiplier),
      winnerRequiredFunding: getRequiredFunding(appealCost, multipliers?.winner_stake_multiplier),
    }),
    [appealCost, multipliers]
  );
  const fundedChoices = getFundedChoices(data?.dispute);
  const [selectedOption, setSelectedOption] = useState<number | undefined>();

  return (
    <CountdownContext.Provider
      value={useMemo(() => ({ loserSideCountdown, winnerSideCountdown }), [loserSideCountdown, winnerSideCountdown])}
    >
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

const getPaidFees = (dispute?: ClassicAppealQuery["dispute"]) => {
  const currentLocalRound = getCurrentLocalRound(dispute);
  return currentLocalRound?.paidFees.map((amount: string) => BigInt(amount));
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
