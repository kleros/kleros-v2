import React, { useMemo } from "react";

import { GIT_BRANCH, GIT_DIRTY, GIT_HASH, GIT_TAGS, GIT_URL, RELEASE_VERSION } from "consts/index";
import { useToggleTheme } from "hooks/useToggleThemeContext";
import { isUndefined } from "utils/index";

import Phase from "components/Phase";

const Version = () => (
  <label className="pl-2">
    v{RELEASE_VERSION}{" "}
    <a href={GIT_URL} target="_blank" rel="noreferrer">
      #{GIT_HASH}
    </a>
    {GIT_BRANCH && GIT_BRANCH !== "HEAD" && ` ${GIT_BRANCH}`}
    {GIT_TAGS && ` ${GIT_TAGS}`}
    {GIT_DIRTY && ` dirty`}
  </label>
);

const ServicesStatus = () => {
  const [theme] = useToggleTheme();
  const statusUrlParameters = useMemo(() => (theme === "light" ? "?theme=light" : "?theme=dark"), [theme]);
  const statusUrl = import.meta.env.REACT_APP_STATUS_URL;
  return (
    <label>
      {isUndefined(statusUrl) ? null : (
        <iframe src={`${statusUrl + statusUrlParameters}`} className="border-0 w-full h-[30px] rounded-[3px]" />
      )}
    </label>
  );
};

const Debug: React.FC = () => {
  return (
    <div
      className={
        'flex flex-col gap-3 p-[0px_3px] [&_label]:[font-family:"Roboto_Mono",_monospace] [&_label]:leading-[10px] [&_label]:text-[10px] [&_label]:text-klerosUIComponentsStroke [&_a]:[font-family:"Roboto_Mono",_monospace] [&_a]:leading-[10px] [&_a]:text-[10px] [&_a]:text-klerosUIComponentsStroke'
      }
    >
      <ServicesStatus />
      <Version />
      <Phase className="pl-2" />
    </div>
  );
};

export default Debug;
