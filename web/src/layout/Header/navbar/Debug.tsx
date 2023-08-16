import React from "react";
import styled from "styled-components";
import { GIT_BRANCH, GIT_DIRTY, GIT_HASH, GIT_URL, RELEASE_VERSION } from "../../../consts";
import { usePhase } from "~src/hooks/queries/usePhase";

const Container = styled.div`
  label,
  a {
    font-family: "Roboto Mono", monospace;
    line-height: 10px;
    font-size: 10px;
    color: ${({ theme }) => theme.stroke};
  }
`;

const Version = () => (
  <label>
    v{RELEASE_VERSION}{" "}
    <a href={GIT_URL} target="_blank" rel="noreferrer">
      #{GIT_HASH}
    </a>{" "}
    {GIT_BRANCH}
    {GIT_DIRTY && " dirty"}
  </label>
);

const Phase = () => {
  const { data: phase } = usePhase();
  return <label>phase: {phase}</label>;
};

const Debug: React.FC = () => {
  return (
    <Container>
      <Version />
      <label>{", "}</label>
      <Phase />
    </Container>
  );
};

export default Debug;
