import React from "react";
import styled from "styled-components";
import { utils } from "ethers";
import { Card } from "@kleros/ui-components-library";
import StatDisplay from "components/StatDisplay";
import PNKIcon from "svgs/icons/pnk.svg";
import EthereumIcon from "svgs/icons/ethereum.svg";
import PNKRedistributedIcon from "svgs/icons/redistributed-pnk.svg";
import JurorIcon from "svgs/icons/user.svg";
import BalanceIcon from "svgs/icons/law-balance.svg";
import { useHomePageContext } from "hooks/useHomePageContext";

const StyledCard = styled(Card)`
  width: auto;
  height: fit-content;
  padding: 16px;
  display: flex;
  gap: 32px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const Stats = () => {
  const { data } = useHomePageContext();
  const {
    pnkstakedDataPoints: stakedPNK = undefined,
    ethpaidDataPoints: paidETH = undefined,
    pnkredistributedDataPoints: redistributedPNK = undefined,
    activeJurorsDataPoints: activeJurors = undefined,
    casesDataPoints: cases = undefined,
  } = data ? data : {};
  return (
    <StyledCard>
      <StatDisplay
        title="PNK staked"
        text={
          stakedPNK
            ? utils.commify(utils.formatUnits(stakedPNK.at(-1)?.value, 18))
            : "Fetching..."
        }
        subtext="$ 3,000,000"
        color="purple"
        icon={PNKIcon}
      />
      <StatDisplay
        title="ETH Paid to jurors"
        text={
          paidETH
            ? utils.commify(utils.formatEther(paidETH.at(-1)?.value))
            : "Fetching..."
        }
        subtext="$ 3,000,000"
        color="blue"
        icon={EthereumIcon}
      />
      <StatDisplay
        title="PNK redistributed"
        text={
          redistributedPNK
            ? utils.commify(utils.formatUnits(redistributedPNK.at(-1)?.value, 18))
            : "Fetching..."
        }
        subtext="$ 3,000,000"
        color="purple"
        icon={PNKRedistributedIcon}
      />
      <StatDisplay
        title="Active jurors"
        text={activeJurors ? activeJurors.at(-1)?.value : "Fetching..."}
        subtext="$ 3,000,000"
        color="green"
        icon={JurorIcon}
      />
      <StatDisplay
        title="Cases"
        text={cases ? cases.at(-1)?.value : "Fetching..."}
        subtext="$ 3,000,000"
        color="orange"
        icon={BalanceIcon}
      />
    </StyledCard>
  );
};

export default Stats;
