import React, { useState } from "react";
import styled from "styled-components";
import {
  Routes,
  Route,
  useParams,
  useNavigate,
  Navigate,
} from "react-router-dom";
import {
  Tabs as TabsComponent,
  Card,
  Box,
  Steps,
} from "@kleros/ui-components-library";
import { Periods } from "consts/periods";
import {
  useDisputeDetailsQuery,
  DisputeDetailsQuery,
} from "queries/useDisputeDetailsQuery";
import { secondsToDayHourMinute, getTimeLeft } from "utils/date";
import EyeIcon from "assets/svgs/icons/eye.svg";
import DocIcon from "assets/svgs/icons/doc.svg";
import BalanceIcon from "assets/svgs/icons/law-balance.svg";
import BullhornIcon from "assets/svgs/icons/bullhorn.svg";
import Overview from "./Overview";
import Evidence from "./Evidence";
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

const getTimeline = (
  dispute: DisputeDetailsQuery["dispute"],
  currentPeriodIndex: number
) => {
  const titles = [
    "Evidence Period",
    "Voting Period",
    "Appeal Period",
    "Execution Period",
  ];
  return titles.map((title, i) => ({
    title,
    subitems:
      currentPeriodIndex === i
        ? [
            secondsToDayHourMinute(
              getTimeLeft(
                parseInt(dispute?.lastPeriodChange),
                parseInt(dispute?.subcourtID.timesPerPeriod[i])
              )
            ),
          ]
        : currentPeriodIndex > i
        ? ["00d 00m"]
        : [secondsToDayHourMinute(dispute?.subcourtID.timesPerPeriod[i])],
  }));
};

const CaseDetails: React.FC = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const { id } = useParams();
  const { data } = useDisputeDetailsQuery(id ? parseInt(id) : undefined);
  const dispute = data?.dispute;
  const currentPeriodIndex = dispute ? Periods[dispute.period] : 0;
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
      <TimeLineContainer>
        <StyledSteps
          horizontal
          currentItemIndex={currentPeriodIndex}
          items={getTimeline(dispute, currentPeriodIndex)}
        />
      </TimeLineContainer>
      <StyledCard>
        <Routes>
          <Route
            path="overview"
            element={<Overview arbitrable={dispute?.arbitrated} />}
          />
          <Route path="evidence" element={<Evidence />} />
          <Route
            path="voting"
            element={<Binary arbitrable={dispute?.arbitrated} />}
          />
          <Route path="*" element={<Navigate to="overview" />} />
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

const TimeLineContainer = styled(Box)`
  width: 100%;
  height: 100px;
  border-radius: 3px;
  margin: 16px 0px;
  padding: 8px;
`;

const StyledSteps = styled(Steps)`
  width: 85%;
  margin: auto;
`;

const StyledCard = styled(Card)`
  margin-top: 16px;
  width: 100%;
  height: auto;
  min-height: 100px;
`;

export default CaseDetails;
