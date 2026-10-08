import React from "react";

import { Address } from "viem";

import EthIcon from "svgs/icons/eth.svg";
import PnkIcon from "svgs/icons/kleros.svg";

import { useUserQuery } from "hooks/queries/useUser";
import useIsDesktop from "hooks/useIsDesktop";
import { getFormattedRewards } from "utils/jurorRewardConfig";

import NumberDisplay from "components/NumberDisplay";

interface IRewards {
  address: Address;
}

const Rewards: React.FC<IRewards> = ({ address }) => {
  const { data: userData } = useUserQuery(address);
  const formattedRewards = getFormattedRewards(userData, {});
  const ethReward = formattedRewards.find((r) => r.token === "ETH")?.amount;
  const pnkReward = formattedRewards.find((r) => r.token === "PNK")?.amount;
  const isDesktop = useIsDesktop();

  return (
    <div className="flex gap-2 items-center flex-wrap mt-0.5 lg:justify-center">
      <label className="text-[16px] font-semibold text-klerosUIComponentsPrimaryText">
        <NumberDisplay
          value={ethReward ?? ""}
          unit="ETH"
          showUnitInDisplay={false}
          place={isDesktop ? "top" : "right"}
        />
      </label>
      <EthIcon className="size-4 [&_path]:fill-klerosUIComponentsSecondaryPurple" />
      <label className="text-[16px] font-semibold text-klerosUIComponentsPrimaryText">+</label>
      <label className="text-[16px] font-semibold text-klerosUIComponentsPrimaryText">
        <NumberDisplay value={pnkReward ?? ""} unit="PNK" showUnitInDisplay={false} />
      </label>
      <PnkIcon className="size-4 [&_path]:fill-klerosUIComponentsSecondaryPurple" />
    </div>
  );
};
export default Rewards;
