import React from "react";
import styled from "styled-components";

import { useSortitionModulePhase } from "hooks/useSortitionModulePhase";

import { isUndefined } from "src/utils";

export enum Phases {
  staking,
  generating,
  drawing,
}

const StyledLabel = styled.label``;

const Phase: React.FC<{ className?: string }> = ({ className }) => {
  const { data: phase } = useSortitionModulePhase();
  return <>{isUndefined(phase) ? null : <StyledLabel {...{ className }}>Phase: {Phases[phase]}</StyledLabel>}</>;
};

export default Phase;
