import React from "react";
import styled from "styled-components";
import StageOneSvg from "tsx:assets/svgs/mini-guides/appeal/stage-one.svg";
import { StyledImage } from "../PageContentsTemplate";

const StyledStageOneSvg = styled(StageOneSvg)`
  [class$="rect-1"],
  [class$="rect-2"],
  [class$="rect-6"],
  [class$="circle-1"],
  [class$="circle-2"] {
    fill: ${({ theme }) => theme.whiteBackground};
  }

  [class$="rect-4"],
  [class$="rect-8"] {
    fill: ${({ theme }) => theme.stroke};
  }

  [class$="rect-5"],
  [class$="path-9"],
  [class$="path-10"] {
    fill: ${({ theme }) => theme.secondaryPurple};
  }

  [class$="rect-9"],
  [class$="circle-3"] {
    fill: ${({ theme }) => theme.primaryBlue};
  }

  [class$="rect-10"] {
    fill: ${({ theme }) => theme.lightBlue};
    stroke: ${({ theme }) => theme.mediumBlue};
  }

  [class$="rect-11"],
  [class$="rect-12"] {
    fill: ${({ theme }) => theme.white};
  }

  [class$="path-2"],
  [class$="path-6"] {
    fill: ${({ theme }) => theme.primaryText};
  }

  [class$="path-1"],
  [class$="path-5"] {
    fill: ${({ theme }) => theme.secondaryText};
  }

  [class$="path-3"],
  [class$="path-4"] {
    fill: ${({ theme }) => theme.success};
  }

  [class$="path-7"],
  [class$="path-8"] {
    fill: ${({ theme }) => theme.warning};
  }

  [class$="rect-3"],
  [class$="rect-7"],
  [class$="circle-1"] {
    stroke: ${({ theme }) => theme.stroke};
  }

  [class$="circle-2"] {
    stroke: ${({ theme }) => theme.primaryBlue};
  }
`;

const StageOne: React.FC = () => <StyledImage as={StyledStageOneSvg} />;

export default StageOne;
