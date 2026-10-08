import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import { useParams } from "react-router-dom";
import { Address, formatEther } from "viem";
import { useAccount } from "wagmi";

import Check from "svgs/icons/check-circle-outline.svg";

import { useCourtDetails } from "hooks/queries/useCourtDetails";
import { cn } from "utils/cn";
import { commify } from "utils/commify";

import { useJurorStakeDetailsQuery } from "queries/useJurorStakeDetailsQuery";

import { isUndefined } from "src/utils";

import WithHelpTooltip from "components/WithHelpTooltip";

import QuantityToSimulate, { Quantity, TextWithTooltipContainer } from "../Simulator/QuantityToSimulate";
import { ActionType } from "../StakeWithdrawButton";

const StakingMsg = React.forwardRef<React.ElementRef<"h1">, React.ComponentPropsWithoutRef<"h1">>(function StakingMsg(
  { className, ...props },
  ref
) {
  return <h1 {...props} ref={ref} className={cn("font-normal m-0 p-0 text-center", className)} />;
});

interface IHeader {
  action: ActionType;
  amount: string;
  isSuccess: boolean;
}

const Header: React.FC<IHeader> = ({ action, amount, isSuccess }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: courtDetails } = useCourtDetails(id);
  const { address } = useAccount();
  const { data: stakeData } = useJurorStakeDetailsQuery(address?.toLowerCase() as Address);
  const jurorStakeData = stakeData?.jurorTokensPerCourts?.find(({ court }) => court.id === id);
  const jurorCurrentEffectiveStake =
    address && jurorStakeData ? Number(formatEther(BigInt(jurorStakeData.effectiveStake))) : 0;
  const jurorCurrentSpecificStake = address && jurorStakeData ? Number(formatEther(BigInt(jurorStakeData.staked))) : 0;

  const effectiveStakeDisplay = !isUndefined(jurorCurrentEffectiveStake) ? (
    `${commify(jurorCurrentEffectiveStake)} PNK`
  ) : (
    <Skeleton width={50} />
  );

  const isWithdraw = action === ActionType.withdraw;

  const stakingMessage = useMemo(() => {
    if (isSuccess) {
      return isWithdraw ? t("staking.you_successfully_withdrew") : t("staking.you_successfully_staked");
    }
    return isWithdraw ? t("staking.you_are_withdrawing") : t("staking.you_are_staking");
  }, [isSuccess, isWithdraw, t]);

  return (
    <div className="flex flex-col gap-2.25 items-center">
      {isSuccess ? <Check className="[&_path]:fill-klerosUIComponentsSuccess w-[80px] h-[80px]" /> : null}
      <StakingMsg>{stakingMessage}</StakingMsg>
      <StakingMsg className="font-semibold text-klerosUIComponentsSecondaryPurple text-center">
        {commify(amount)} PNK
      </StakingMsg>
      {courtDetails?.court?.name ? (
        <label className="mb-3.75">{t("staking.on_court", { court: courtDetails.court.name })}</label>
      ) : null}
      {isSuccess ? (
        <div className="flex items-center justify-center gap-2">
          <Quantity>{effectiveStakeDisplay}</Quantity>
          <TextWithTooltipContainer>
            <WithHelpTooltip tooltipMsg={t("staking.stake_confirmed_tooltip")}>
              {t("staking.current_stake")}
            </WithHelpTooltip>
          </TextWithTooltipContainer>{" "}
        </div>
      ) : (
        <QuantityToSimulate
          {...{
            jurorCurrentEffectiveStake,
            jurorCurrentSpecificStake,
            isStaking: !isWithdraw,
            amountToStake: Number(amount),
          }}
        />
      )}
    </div>
  );
};

export default Header;
