import React from "react";
import styled from "styled-components";
import StageTwoSvg from "tsx:assets/svgs/mini-guides/appeal/stage-two.svg";
import { StyledImage } from "../PageContentsTemplate";

const StyledStageTwoSvg = styled(StageTwoSvg)`
  [class$="rect-1"] {
    fill: ${({ theme }) => theme.whiteBackground};
  }

  [class$="rect-2"],
  [class$="rect-6"] {
    fill: ${({ theme }) => theme.lightBlue};
    stroke: ${({ theme }) => theme.mediumBlue};
  }

  [class$="rect-3"],
  [class$="path-2"],
  [class$="path-3"] {
    fill: ${({ theme }) => theme.success};
  }

  [class$="rect-4"] {
    fill: ${({ theme }) => theme.stroke};
  }

  [class$="rect-5"] {
    fill: ${({ theme }) => theme.primaryBlue};
  }

  [class$="rect-7"] {
    fill: ${({ theme }) => theme.white};
  }

  [class$="rect-6"],
  [class$="line-1"] {
    stroke: ${({ theme }) => theme.mediumBlue};
  }

  [class$="path-1"],
  [class$="path-4"],
  [class$="path-5"],
  [class$="path-6"] {
    fill: ${({ theme }) => theme.primaryText};
  }

  [class$="path-7"],
  [class$="path-8"] {
    fill: ${({ theme }) => theme.secondaryPurple};
  }
`;

const StageTwo: React.FC = () => <StyledImage as={StyledStageTwoSvg} />;

export default StageTwo;
