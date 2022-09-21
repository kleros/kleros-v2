import React, { useState } from "react";
import styled from "styled-components";
import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import { Tabs as TabsComponent, Card } from "@kleros/ui-components-library";
import EyeIcon from "assets/svgs/icons/eye.svg";
import DocIcon from "assets/svgs/icons/doc.svg";
import BalanceIcon from "assets/svgs/icons/law-balance.svg";
import BullhornIcon from "assets/svgs/icons/bullhorn.svg";
import { Binary } from "./voting";

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

const CaseDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  return (
    <Container>
      <h1>Case #{id}</h1>
      <StyledTabs
        currentValue={currentTab}
        items={TABS}
        callback={(n: number) => {
          setCurrentTab(n);
          navigate(TABS[n].path);
        }}
      />
      <StyledCard>
        <Routes>
          <Route path="voting" element={<Binary />} />
        </Routes>
      </StyledCard>
    </Container>
  );
};

const Container = styled.div``;

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

const StyledCard = styled(Card)`
  margin-top: 16px;
  width: 100%;
  height: auto;
  min-height: 100px;
`;

export default CaseDetails;
