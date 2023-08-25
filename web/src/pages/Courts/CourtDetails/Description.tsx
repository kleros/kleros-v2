import React, { useEffect, useState } from "react";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import { Routes, Route, Navigate, useParams, useNavigate, useLocation } from "react-router-dom";
import { Tabs } from "@kleros/ui-components-library";
import { StyledSkeleton } from "components/StyledSkeleton";
import { useCourtPolicy } from "queries/useCourtPolicy";

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
  const currentPathName = useLocation().pathname.split("/").at(-1);
  const [currentTab, setCurrentTab] = useState(TABS.findIndex(({ path }) => path === currentPathName));
  useEffect(() => setCurrentTab(TABS.findIndex(({ path }) => path === currentPathName)), [currentPathName]);

  const filteredTabs = TABS.filter(({ isVisible }) => isVisible(policy));

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const scrollToSection = queryParams.get("section");

  useEffect(() => {
    if (scrollToSection === "description") {
      const element = document.getElementById(scrollToSection);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [scrollToSection]);

  return (
    <Container id="description">
      <StyledTabs
        currentValue={currentTab}
        items={filteredTabs}
        callback={(n: number) => {
          setCurrentTab(n);
          navigate(TABS[n].path);
        }}
      />
      <TextContainer>
        <Routes>
          <Route path="purpose" element={formatMarkdown(policy?.description)} />
          <Route path="skills" element={<p>{policy?.requiredSkills}</p>} />
          <Route path="policy" element={formatMarkdown(policy?.summary)} />
          <Route path="*" element={<Navigate to="purpose" replace />} />
        </Routes>
      </TextContainer>
    </Container>
  );
};

const formatMarkdown = (markdown?: string) =>
  markdown ? (
    <ReactMarkdown>{typeof markdown === "string" ? markdown.replace(/\n/g, "  \n") : markdown}</ReactMarkdown>
  ) : (
    <StyledSkeleton />
  );

export default Description;
