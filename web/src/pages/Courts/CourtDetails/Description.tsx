import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { Routes, Route, Navigate, useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";

import { Tabs } from "@kleros/ui-components-library";

import { useCourtPolicy } from "queries/useCourtPolicy";

import MarkdownRenderer from "components/MarkdownRenderer";
import { StyledSkeleton } from "components/StyledSkeleton";

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

  const tabItems = filteredTabs.map(({ text, path }) => ({
    id: path,
    text,
    value: path,
    content: null,
  }));

  const activePath = filteredTabs.some(({ path }) => path === currentPathName)
    ? currentPathName
    : filteredTabs[0]?.path;
  useEffect(() => {
    if (currentPathName && !filteredTabs.map((t) => t.path).includes(currentPathName) && filteredTabs.length > 0) {
      navigate(`${filteredTabs[0].path}${suffix}`, { replace: true });
    }
  }, [policy, currentPathName, filteredTabs, navigate, suffix]);
  return policy ? (
    <div id="description" className="w-full">
      <Tabs
        selectedKey={activePath}
        items={tabItems}
        callback={(key) => navigate(`${String(key)}${suffix}`)}
        className={"tabs-selected-underline w-full [&_>_*]:flex [&_>_*]:flex-wrap [&_>_*_>_svg]:mr-0!"}
      />
      <div className="w-full p-[12px_0]">
        <Routes>
          <Route path="purpose" element={formatMarkdown(policy?.purpose)} />
          <Route path="skills" element={formatMarkdown(policy?.requiredSkills)} />
          <Route path="policy" element={formatMarkdown(policy?.rules)} />
          <Route path="*" element={<Navigate to={filteredTabs.length > 0 ? filteredTabs[0].path : ""} replace />} />
        </Routes>
      </div>
    </div>
  ) : null;
};

const formatMarkdown = (markdown?: string) =>
  markdown ? (
    <MarkdownRenderer
      content={markdown}
      className="[&_p]:[word-break:break-word] [&_ul_li_+_li]:mt-2 [&_ol_li_+_li]:mt-2 [&_h1]:m-[16px_0_16px_0] [&_h1]:text-[20px] [&_h1]:leading-[26px] [&_h2]:m-[16px_0_16px_0] [&_h2]:text-[20px] [&_h2]:leading-[26px] [&_h3]:m-[16px_0_16px_0] [&_h3]:text-[18px] [&_h3]:leading-[24px] [&_a]:text-[16px]"
    />
  ) : (
    <StyledSkeleton />
  );

export default Description;
