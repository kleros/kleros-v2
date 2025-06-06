import React, { useMemo } from "react";
import styled from "styled-components";

import { GIT_BRANCH, GIT_DIRTY, GIT_HASH, GIT_TAGS, GIT_URL, RELEASE_VERSION } from "consts/index";
import { useToggleTheme } from "hooks/useToggleThemeContext";
import { isUndefined } from "utils/index";

import Phase from "components/Phase";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0px 3px;

  label,
  a {
    font-family: "Roboto Mono", monospace;
    line-height: 10px;
    font-size: 10px;
    color: ${({ theme }) => theme.stroke};
  }
`;

const StyledIframe = styled.iframe`
  border: none;
  width: 100%;
  height: 30px;
  border-radius: 3px;
`;

const StyledLabel = styled.label`
  padding-left: 8px;
`;

const StyledPhase = styled(Phase)`
  padding-left: 8px;
`;

const Version = () => (
  <StyledLabel>
    v{RELEASE_VERSION}{" "}
    <a href={GIT_URL} target="_blank" rel="noreferrer">
      #{GIT_HASH}
    </a>
    {GIT_BRANCH && GIT_BRANCH !== "HEAD" && ` ${GIT_BRANCH}`}
    {GIT_TAGS && ` ${GIT_TAGS}`}
    {GIT_DIRTY && ` dirty`}
  </StyledLabel>
);

const ServicesStatus = () => {
  const [theme] = useToggleTheme();
  const statusUrlParameters = useMemo(() => (theme === "light" ? "?theme=light" : "?theme=dark"), [theme]);
  const statusUrl = import.meta.env.REACT_APP_STATUS_URL;
  return <label>{isUndefined(statusUrl) ? null : <StyledIframe src={`${statusUrl + statusUrlParameters}`} />}</label>;
};

const Debug: React.FC = () => {
  return (
    <Container>
      <ServicesStatus />
      <Version />
      <StyledPhase />
    </Container>
  );
};

export default Debug;
