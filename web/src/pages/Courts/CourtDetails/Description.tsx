import React from "react";
import styled from "styled-components";

import ReactMarkdown from "react-markdown";
import { Routes, Route, Navigate, useParams, useNavigate, useLocation } from "react-router-dom";

import { Tabs } from "@kleros/ui-components-library";

import { useCourtPolicy } from "queries/useCourtPolicy";

import { StyledSkeleton } from "components/StyledSkeleton";

const Container = styled.div`
  width: 100%;
`;

const TextContainer = styled.div`
  width: 100%;
  padding: 12px 0;
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

interface IPolicy {
  description?: string;
  requiredSkills?: string;
  summary?: string;
}

const TABS = [
  {
    text: "Purpose",
    value: 0,
    path: "purpose",
    isVisible: (policy: IPolicy) => !!policy?.description,
  },
  {
    text: "Skills",
    value: 1,
    path: "skills",
    isVisible: (policy: IPolicy) => !!policy?.requiredSkills,
  },
  {
    text: "Policy",
    value: 2,
    path: "policy",
    isVisible: (policy: IPolicy) => !!policy?.summary,
  },
];

const Description: React.FC = () => {
  const { id } = useParams();
  const { data: policy } = useCourtPolicy(id);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPathName = location.pathname.split("/").at(-1);

  const filteredTabs = TABS.filter(({ isVisible }) => isVisible(policy));
  const currentTab = TABS.findIndex(({ path }) => path === currentPathName);

  const handleTabChange = (index: number) => {
    navigate(TABS[index].path);
  };

  return (
    <Container id="description">
      <StyledTabs currentValue={currentTab} items={filteredTabs} callback={handleTabChange} />
      <TextContainer>
        <Routes>
          <Route path="purpose" element={formatMarkdown(policy?.description)} />
          <Route path="skills" element={formatMarkdown(policy?.requiredSkills)} />
          <Route
            path="policy"
            element={
              policy?.summary ? (
                formatMarkdown(policy?.summary)
              ) : (
                <Navigate to={filteredTabs.length > 0 ? filteredTabs[0].path : ""} replace />
              )
            }
          />
          <Route path="*" element={<Navigate to={filteredTabs.length > 0 ? filteredTabs[0].path : ""} replace />} />
        </Routes>
      </TextContainer>
    </Container>
  );
};

const formatMarkdown = (markdown?: string) =>
  markdown ? <ReactMarkdown>{markdown.replace(/\n/g, "  \n")}</ReactMarkdown> : <StyledSkeleton />;

export default Description;
