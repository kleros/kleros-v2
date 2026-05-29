import React, { useMemo } from "react";
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
  }
  // Set on the label, not the container: the library's text-base wouldn't inherit.
  [role="tab"] {
    span {
      font-size: ${responsiveSize(12, 16)};
    }
    svg {
      margin-right: 8px;
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
        id: 0,
        text: t("navigation.overview"),
        value: 0,
        Icon: EyeIcon,
        path: "overview",
        content: null,
      },
      {
        id: 1,
        text: t("navigation.evidence"),
        value: 1,
        Icon: DocIcon,
        path: "evidence",
        content: null,
      },
      {
        id: 2,
        text: t("navigation.voting"),
        value: 2,
        Icon: BalanceIcon,
        path: "voting",
        content: null,
      },
      {
        id: 3,
        text: t("navigation.appeal"),
        value: 3,
        Icon: BullhornIcon,
        path: "appeal",
        disabled: false,
        content: null,
      },
    ],
    [t]
  );

  const currentTab = Math.max(
    TABS.findIndex(({ path }) => path === currentPathName),
    0
  );

  const tabs = useMemo(() => {
    const updatedTabs = [...TABS];
    const periodIndex = Number.parseInt(String(currentPeriodIndex));
    updatedTabs[3].disabled =
      (periodIndex < 3 && rounds.length === 1) ||
      (!isUndefined(appealCost) && isLastRound(appealCost) && periodIndex === 3);

    return updatedTabs;
  }, [currentPeriodIndex, rounds.length, appealCost, TABS]);

  // Both props: `selectedKey` keeps the URL the source of truth; `defaultSelectedKey`
  // primes the library Tabs' internal underline state (which doesn't track `selectedKey`).
  return (
    <StyledTabs
      selectedKey={currentTab}
      defaultSelectedKey={currentTab}
      items={tabs}
      callback={(_key, value) => navigate(TABS[value].path)}
    />
  );
};

export default Tabs;
