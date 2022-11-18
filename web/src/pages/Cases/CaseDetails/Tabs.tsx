import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs as TabsComponent } from "@kleros/ui-components-library";
import EyeIcon from "assets/svgs/icons/eye.svg";
import DocIcon from "assets/svgs/icons/doc.svg";
import BalanceIcon from "assets/svgs/icons/law-balance.svg";
import BullhornIcon from "assets/svgs/icons/bullhorn.svg";

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
  },
];

const Tabs: React.FC = () => {
  const navigate = useNavigate();
  const currentPathName = useLocation().pathname.split("/").at(-1);
  const [currentTab, setCurrentTab] = useState(
    TABS.findIndex(({ path }) => path === currentPathName)
  );
  useEffect(
    () => setCurrentTab(TABS.findIndex(({ path }) => path === currentPathName)),
    [currentPathName]
  );
  return (
    <StyledTabs
      currentValue={currentTab}
      items={TABS}
      callback={(n: number) => {
        setCurrentTab(n);
        navigate(TABS[n].path);
      }}
    />
  );
};

const StyledTabs = styled(TabsComponent)`
  width: 100%;
  > * {
    display: flex;
    flex-wrap: wrap;
    > svg {
      margin-right: 0px !important;
    }
  }
`;

export default Tabs;
