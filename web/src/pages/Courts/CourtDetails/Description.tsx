import React, { useEffect } from "react";
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

  p {
    word-break: break-word;
  }

  li {
    line-height: 1.5em;
    margin-top: 0.5em;
  }

  h1 {
    margin: 16px 0 16px 0;
    font-size: 24px;
    line-height: 32px;
  }

  h2 {
    margin: 16px 0 16px 0;
    font-size: 20px;
    line-height: 24px;
  }

  h3 {
    margin: 16px 0 16px 0;
    font-size: 18px;
    line-height: 20px;
  }

  a {
    font-size: 16px;
  }
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
  purpose?: string;
  requiredSkills?: string;
  rules?: string;
}

const TABS = [
  {
    text: "Purpose",
    value: 0,
    path: "purpose",
    isVisible: (policy: IPolicy) => !!policy?.purpose,
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
    isVisible: (policy: IPolicy) => !!policy?.rules,
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

  useEffect(() => {
    if (currentPathName && !filteredTabs.map((t) => t.path).includes(currentPathName) && filteredTabs.length > 0) {
      navigate(filteredTabs[0].path, { replace: true });
    }
  }, [policy, currentPathName, filteredTabs, navigate]);

  return (
    <>
      {policy ? (
        <Container id="description">
          <StyledTabs currentValue={currentTab} items={filteredTabs} callback={handleTabChange} />
          <TextContainer>
            <Routes>
              <Route path="purpose" element={formatMarkdown(policy?.purpose)} />
              <Route path="skills" element={formatMarkdown(policy?.requiredSkills)} />
              <Route path="policy" element={formatMarkdown(policy?.rules)} />
              <Route path="*" element={<Navigate to={filteredTabs.length > 0 ? filteredTabs[0].path : ""} replace />} />
            </Routes>
          </TextContainer>
        </Container>
      ) : null}
    </>
  );
};

const formatMarkdown = (markdown?: string) =>
  markdown ? <ReactMarkdown>{markdown.replace(/\n/g, "  \n")}</ReactMarkdown> : <StyledSkeleton />;

export default Description;
