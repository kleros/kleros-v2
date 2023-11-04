import React from "react";
import styled from "styled-components";
import VotingModuleSvg from "tsx:assets/svgs/mini-guides/binary-voting/voting-module.svg";
import { StyledImage } from "../PageContentsTemplate";

const StyledVotingModuleSvg = styled(VotingModuleSvg)`
  [class$="rect-1"],
  [class$="rect-4"],
  [class$="path-1"],
  [class$="path-2"] {
    fill: ${({ theme }) => theme.whiteBackground};
  }

  [class$="rect-2"],
  [class$="rect-3"],
  [class$="path-4"] {
    fill: ${({ theme }) => theme.primaryBlue};
  }

  [class$="path-3"] {
    fill: ${({ theme }) => theme.lightBlue};
  }

  [class$="path-5"] {
    fill: ${({ theme }) => theme.secondaryText};
  }

  [class$="rect-1"] {
    stroke: ${({ theme }) => theme.stroke};
  }

  [class$="rect-5"] {
    stroke: ${({ theme }) => theme.primaryBlue};
  }
`;

const VotingModule: React.FC = () => <StyledImage as={StyledVotingModuleSvg} />;

export default VotingModule;
