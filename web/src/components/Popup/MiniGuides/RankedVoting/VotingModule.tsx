import React from "react";
import styled from "styled-components";
import VotingModuleSvg from "tsx:assets/svgs/mini-guides/ranked-voting/voting-module.svg";
import { StyledImage } from "../PageContentsTemplate";

const StyledVotingModuleSvg = styled(VotingModuleSvg)`
  [class$="path-1"],
  [class$="path-5"] {
    fill: ${({ theme }) => theme.success};
  }
  [class$="rect-1"],
  [class$="rect-2"],
  [class$="rect-4"],
  [class$="rect-8"],
  [class$="rect-13"],
  [class$="path-3"],
  [class$="path-4"],
  [class$="path-7"],
  [class$="path-8"],
  [class$="path-13"],
  [class$="path-12"],
  [class$="path-14"] {
    fill: ${({ theme }) => theme.whiteBackground};
  }

  [class$="rect-1"],
  [class$="rect-3"],
  [class$="rect-5"],
  [class$="rect-7"],
  [class$="rect-9"] {
    stroke: ${({ theme }) => theme.stroke};
  }

  [class$="rect-6"] {
    stroke: ${({ theme }) => theme.success};
  }
  [class$="rect-10"] {
    stroke: ${({ theme }) => theme.error};
  }
  [class$="rect-14"] {
    stroke: ${({ theme }) => theme.primaryBlue};
  }

  [class$="rect-11"] {
    fill: ${({ theme }) => theme.lightBlue};
  }

  [class$="rect-12"] {
    fill: ${({ theme }) => theme.primaryBlue};
  }

  [class$="path-11"],
  [class$="path-2"],
  [class$="path-6"] {
    fill: ${({ theme }) => theme.primaryText};
  }

  [class$="path-9"] {
    fill: ${({ theme }) => theme.secondaryText};
  }

  [class$="path-10"] {
    fill: ${({ theme }) => theme.error};
  }

  [class$="path-15"] {
    fill: ${({ theme }) => theme.primaryBlue};
  }
`;

const VotingModule: React.FC = () => <StyledImage as={StyledVotingModuleSvg} />;

export default VotingModule;
