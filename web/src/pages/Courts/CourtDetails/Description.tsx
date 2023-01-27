import React, { useEffect, useState } from "react";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import {
  Routes,
  Route,
  Navigate,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Tabs } from "@kleros/ui-components-library";
import { useCourtPolicy } from "queries/useCourtPolicy";

const TABS = [
  {
    text: "Purpose",
    value: 0,
    path: "purpose",
    isVisible: (policy: any) => !!policy?.description,
  },
  {
    text: "Skills",
    value: 1,
    path: "skills",
    isVisible: (policy: any) => !!policy?.requiredSkills,
  },
  {
    text: "Policy",
    value: 2,
    path: "policy",
    isVisible: (policy: any) => !!policy?.summary,
  },
];

const Description: React.FC = () => {
  const { id } = useParams();
  const { data: policy } = useCourtPolicy(id);
  const navigate = useNavigate();
  const currentPathName = useLocation().pathname.split("/").at(-1);
  const [currentTab, setCurrentTab] = useState(
    TABS.findIndex(({ path }) => path === currentPathName)
  );
  useEffect(
    () => setCurrentTab(TABS.findIndex(({ path }) => path === currentPathName)),
    [currentPathName]
  );

  const filteredTabs = TABS.filter(({ isVisible }) => isVisible(policy));

  return (
    <Container>
      <StyledTabs
        currentValue={currentTab}
        items={filteredTabs}
        callback={(n: number) => {
          setCurrentTab(n);
          navigate(TABS[n].path);
        }}
      />
      <Routes>
        <Route path="purpose" element={formatMarkdown(policy?.description)} />
        <Route path="skills" element={<p>{policy?.requiredSkills}</p>} />
        <Route path="policy" element={formatMarkdown(policy?.summary)} />
        <Route path="*" element={<Navigate to="purpose" />} />
      </Routes>
    </Container>
  );
};

const formatMarkdown = (markdown?: string) =>
  markdown ? <ReactMarkdown>{markdown}</ReactMarkdown> : <p>Loading...</p>;

const Container = styled.div`
  width: 100%;
  padding: 0 12px;
`;

const StyledTabs = styled(Tabs)`
  width: 100%;
  > * {
    display: flex;
    flex-wrap: wrap;
    > svg {
      margin-right: 0px !important;
    }
  }
`;

export default Description;
