import React from "react";

import { useTranslation } from "react-i18next";
import { formatUnits } from "viem";

import LockerIcon from "svgs/icons/locker.svg";
import PnkIcon from "svgs/icons/pnk.svg";

import { isUndefined } from "utils/index";

import NumberDisplay from "components/NumberDisplay";

interface IHeader {
  totalAvailableStake: bigint | undefined;
  lockedStake: bigint | undefined;
}

const Header: React.FC<IHeader> = ({ totalAvailableStake, lockedStake }) => {
  const { t } = useTranslation();
  const formattedTotalAvailableStake = !isUndefined(totalAvailableStake) ? formatUnits(totalAvailableStake, 18) : "0";
  const formattedLockedStake = !isUndefined(lockedStake) ? formatUnits(lockedStake, 18) : "0";

  return (
    <div className="flex flex-row flex-wrap w-full gap-[4px_16px] items-center mb-5 lg:justify-between">
      <h1 className="mb-0 text-[calc(20px_+_(24_-_20)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
        {t("profile.current_stakes")}
      </h1>
      <div className="flex flex-row gap-[12px_24px] flex-wrap">
        {!isUndefined(totalAvailableStake) ? (
          <div className="flex gap-2 items-center">
            <PnkIcon className="fill-klerosUIComponentsSecondaryPurple w-[16px]" />
            <label> {t("profile.total_available_stake")} </label>
            <small>
              <NumberDisplay value={formattedTotalAvailableStake} unit="PNK" />
            </small>
          </div>
        ) : null}
        {!isUndefined(lockedStake) ? (
          <div className="flex gap-2 items-center">
            <LockerIcon className="fill-klerosUIComponentsSecondaryPurple w-[14px]" />
            <label> {t("profile.locked_stake")} </label>
            <small>
              <NumberDisplay value={formattedLockedStake} unit="PNK" />
            </small>
          </div>
        ) : null}
      </div>
    </div>
  );
};
export default Header;
