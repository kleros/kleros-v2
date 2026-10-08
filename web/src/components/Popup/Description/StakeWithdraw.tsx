import React from "react";

import { useTranslation } from "react-i18next";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

import KlerosLogo from "svgs/icons/kleros.svg";

import { REFETCH_INTERVAL } from "consts/index";
import { useReadSortitionModuleGetJurorBalance } from "hooks/contracts/generated";
import { cn } from "utils/cn";
import { isUndefined } from "utils/index";

interface IStakeWithdraw {
  pnkStaked: string;
  courtName: string;
  isStake: boolean;
  courtId: string;
}

interface IAmountStakedOrWithdrawn {
  pnkStaked: string;
  isStake: boolean;
}

const AmountStakedOrWithdrawn: React.FC<IAmountStakedOrWithdrawn> = ({ pnkStaked, isStake }) => {
  return isStake ? <div>+ {pnkStaked} PNK</div> : <div>- {pnkStaked} PNK</div>;
};

const StakeWithdraw: React.FC<IStakeWithdraw> = ({ pnkStaked, courtName, isStake, courtId }) => {
  const { t } = useTranslation();
  const { address } = useAccount();

  const { data: jurorBalance } = useReadSortitionModuleGetJurorBalance({
    query: {
      enabled: !isUndefined(address) && !isUndefined(courtId),
      refetchInterval: REFETCH_INTERVAL,
    },
    args: [address ?? "0x", BigInt(courtId)],
  });

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "flex mb-[calc(16px_+_(32_-_16)_*_(min(max(100vw,_300px),_1250px)_-_300px)_/_(950))]",
          "ml-[calc(8px_+_(44_-_8)_*_(min(max(100vw,_300px),_1250px)_-_300px)_/_(950))]",
          "mr-[calc(8px_+_(44_-_8)_*_(min(max(100vw,_300px),_1250px)_-_300px)_/_(950))]",
          "text-klerosUIComponentsSecondaryText text-center"
        )}
      >
        {t(isStake ? "popups.stake_success" : "popups.unstake_success", { courtName })}
      </div>
      <div
        className={cn(
          "text-[24px] font-semibold text-klerosUIComponentsSecondaryPurple",
          "mb-[calc(0px_+_(4_-_0)_*_(min(max(100vw,_300px),_1250px)_-_300px)_/_(950))]"
        )}
      >
        <AmountStakedOrWithdrawn pnkStaked={pnkStaked} isStake={isStake} />
      </div>

      <div
        className={cn(
          "flex text-[14px] items-center justify-center",
          "mb-[calc(8px_+_(32_-_8)_*_(min(max(100vw,_300px),_1250px)_-_300px)_/_(950))]"
        )}
      >
        <KlerosLogo className="w-[14px] h-[14px]" />{" "}
        <div
          className={cn(
            "flex m-[0px_calc(4px_+_(8_-_4)_*_(min(max(100vw,_300px),_1250px)_-_300px)_/_(950))]",
            "text-klerosUIComponentsSecondaryText"
          )}
        >
          {t("forms.labels.my_stake")}:
        </div>{" "}
        <div className="font-semibold text-klerosUIComponentsPrimaryText">
          {`${formatUnits(jurorBalance?.[2] ?? BigInt(0), 18)} PNK`}{" "}
        </div>
      </div>
    </div>
  );
};
export default StakeWithdraw;
