import React, { useEffect } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { Routes, Route, Navigate, useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";

import { Tabs } from "@kleros/ui-components-library";

import { useCourtPolicy } from "queries/useCourtPolicy";

import MarkdownRenderer from "components/MarkdownRenderer";
import { StyledSkeleton } from "components/StyledSkeleton";

const Container = styled.div`
  width: 100%;
`;

const TextContainer = styled.div`
  width: 100%;
  padding: 12px 0;
`;

const StyledMarkdownRenderer = styled(MarkdownRenderer)`
  p {
    word-break: break-word;
  }

  ul,
  ol {
    li + li {
      margin-top: 8px;
    }
  }

  h1 {
    margin: 16px 0 16px 0;
    font-size: 20px;
    line-height: 26px;
  }

  h2 {
    margin: 16px 0 16px 0;
    font-size: 20px;
    line-height: 26px;
  }

  h3 {
    margin: 16px 0 16px 0;
    font-size: 18px;
    line-height: 24px;
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

const Description: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: policy } = useCourtPolicy(id);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const currentPathName = location.pathname.split("/").at(-1);

  const TABS = [
    {
      text: t("stats.purpose"),
      value: 0,
      path: "purpose",
      isVisible: (policy: IPolicy) => !!policy?.purpose,
    },
    {
      text: t("stats.skills"),
      value: 1,
      path: "skills",
      isVisible: (policy: IPolicy) => !!policy?.requiredSkills,
    },
    {
      text: t("stats.policy"),
      value: 2,
      path: "policy",
      isVisible: (policy: IPolicy) => !!policy?.rules,
    },
  ];

  const filteredTabs = TABS.filter(({ isVisible }) => isVisible(policy));
  const currentTab = TABS.findIndex(({ path }) => path === currentPathName);

  const handleTabChange = (i: number) => {
    navigate(`${TABS[i].path}${suffix}`);
  };
  useEffect(() => {
    if (currentPathName && !filteredTabs.map((t) => t.path).includes(currentPathName) && filteredTabs.length > 0) {
      navigate(`${filteredTabs[0].path}${suffix}`, { replace: true });
    }
  }, [policy, currentPathName, filteredTabs, navigate, suffix]);
  return policy ? (
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
  ) : null;
};

const formatMarkdown = (markdown?: string) =>
  markdown ? <StyledMarkdownRenderer content={markdown} /> : <StyledSkeleton />;

export default Description;
