import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { useNavigate, useLocation, useParams } from "react-router-dom";

import { Tabs as TabsComponent } from "@kleros/ui-components-library";

import BullhornIcon from "svgs/icons/bullhorn.svg";
import DocIcon from "svgs/icons/doc.svg";
import EyeIcon from "svgs/icons/eye.svg";
import BalanceIcon from "svgs/icons/law-balance.svg";

import { Periods } from "consts/periods";
import { useDisputeDetailsQuery } from "hooks/queries/useDisputeDetailsQuery";
import { useVotingHistory } from "hooks/queries/useVotingHistory";
import { isUndefined } from "utils/index";
import { isLastRound } from "utils/isLastRound";

import { useAppealCost } from "queries/useAppealCost";

import { responsiveSize } from "styles/responsiveSize";

const StyledTabs = styled(TabsComponent)`
  width: 100%;
  margin-top: ${responsiveSize(10, 28)};
  > * {
    display: flex;
    flex-wrap: wrap;
    font-size: ${responsiveSize(12, 16)};
    > svg {
      margin-right: 8px !important;
    }
  }
`;

const Tabs: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { data } = useDisputeDetailsQuery(id);
  const { data: votingHistory } = useVotingHistory(id);
  const { data: appealCost } = useAppealCost(id);
  const rounds = votingHistory?.dispute?.rounds ?? [1];
  const dispute = data?.dispute;
  const currentPeriodIndex = Periods[dispute?.period ?? 0];
  const currentPathName = useLocation().pathname.split("/").at(-1);

  const TABS = useMemo(
    () => [
      {
        text: t("navigation.overview"),
        value: 0,
        Icon: EyeIcon,
        path: "overview",
      },
      {
        text: t("navigation.evidence"),
        value: 1,
        Icon: DocIcon,
        path: "evidence",
      },
      {
        text: t("navigation.voting"),
        value: 2,
        Icon: BalanceIcon,
        path: "voting",
      },
      {
        text: t("navigation.appeal"),
        value: 3,
        Icon: BullhornIcon,
        path: "appeal",
        disabled: false,
      },
    ],
    [t]
  );

  const [currentTab, setCurrentTab] = useState(TABS.findIndex(({ path }) => path === currentPathName));
  useEffect(() => {
    setCurrentTab(TABS.findIndex(({ path }) => path === currentPathName));
  }, [currentPathName, TABS]);

  const tabs = useMemo(() => {
    const updatedTabs = [...TABS];
    updatedTabs[3].disabled =
      (parseInt(currentPeriodIndex) < 3 && rounds.length === 1) ||
      (!isUndefined(appealCost) && isLastRound(appealCost) && parseInt(currentPeriodIndex) === 3);

    return updatedTabs;
  }, [currentPeriodIndex, rounds.length, appealCost, TABS]);

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
