import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Tabs as TabsComponent } from "@kleros/ui-components-library";
import { Periods } from "consts/periods";
import { useVotingHistory } from "hooks/queries/useVotingHistory";
import { useDisputeDetailsQuery } from "hooks/queries/useDisputeDetailsQuery";
import { useAppealCost } from "queries/useAppealCost";
import { isLastRound } from "utils/isLastRound";
import { isUndefined } from "utils/index";
import EyeIcon from "assets/svgs/icons/eye.svg";
import DocIcon from "assets/svgs/icons/doc.svg";
import BalanceIcon from "assets/svgs/icons/law-balance.svg";
import BullhornIcon from "assets/svgs/icons/bullhorn.svg";

const StyledTabs = styled(TabsComponent)`
  width: 100%;
  > * {
    display: flex;
    flex-wrap: wrap;
    > svg {
      margin-right: 8px !important;
    }
  }
`;

const TABS = [
  {
    text: "Overview",
    value: 0,
    Icon: EyeIcon,
    path: "overview",
  },
  {
    text: "Evidence",
    value: 1,
    Icon: DocIcon,
    path: "evidence",
  },
  {
    text: "Voting",
    value: 2,
    Icon: BalanceIcon,
    path: "voting",
  },
  {
    text: "Appeal",
    value: 3,
    Icon: BullhornIcon,
    path: "appeal",
    disabled: false,
  },
];

const Tabs: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data } = useDisputeDetailsQuery(id);
  const { data: votingHistory } = useVotingHistory(id);
  const { data: appealCost } = useAppealCost(id);
  const rounds = votingHistory?.dispute?.rounds ?? [1];
  const dispute = data?.dispute;
  const currentPeriodIndex = Periods[dispute?.period ?? 0];
  const currentPathName = useLocation().pathname.split("/").at(-1);
  const [currentTab, setCurrentTab] = useState(TABS.findIndex(({ path }) => path === currentPathName));
  useEffect(() => {
    setCurrentTab(TABS.findIndex(({ path }) => path === currentPathName));
  }, [currentPathName]);

  const tabs = useMemo(() => {
    const updatedTabs = [...TABS];
    updatedTabs[3].disabled =
      (parseInt(currentPeriodIndex) < 3 && rounds.length === 1) ||
      (!isUndefined(appealCost) && isLastRound(appealCost) && parseInt(currentPeriodIndex) === 3);

    return updatedTabs;
  }, [currentPeriodIndex, id, rounds.length, appealCost]);

  return (
    <StyledTabs
      currentValue={currentTab}
      items={tabs}
      callback={(n: number) => {
        setCurrentTab(n);
        navigate(TABS[n].path);
      }}
    />
  );
};

export default Tabs;
