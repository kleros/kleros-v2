import React from "react";
import styled from "styled-components";
import WhatDoINeedSvg from "tsx:assets/svgs/mini-guides/onboarding/what-do-i-need.svg";
import { StyledImage } from "../PageContentsTemplate";

const StyledWhatDoINeedSvg = styled(WhatDoINeedSvg)`
  [class$="rect-1"] {
    fill: ${({ theme }) => theme.whiteBackground};
  }

  [class$="rect-2"] {
    stroke: ${({ theme }) => theme.stroke};
  }

  [class$="rect-3"],
  [class$="rect-4"],
  [class$="rect-5"] {
    fill: ${({ theme }) => theme.mediumBlue};
  }

  [class$="rect-6"] {
    fill: ${({ theme }) => theme.mediumPurple};
  }

  [class$="rect-7"],
  [class$="rect-8"],
  [class$="rect-9"],
  [class$="rect-10"],
  [class$="rect-11"],
  [class$="rect-12"],
  [class$="rect-13"] {
    fill: ${({ theme }) => theme.white};
  }

  [class$="path-1"],
  [class$="path-18"],
  [class$="path-22"] {
    fill: ${({ theme }) => theme.primaryText};
  }

  [class$="path-2"],
  [class$="path-3"],
  [class$="path-4"],
  [class$="path-7"],
  [class$="path-10"],
  [class$="path-13"],
  [class$="path-16"],
  [class$="path-17"],
  [class$="path-19"],
  [class$="path-20"],
  [class$="path-21"],
  [class$="path-23"],
  [class$="path-24"],
  [class$="path-25"] {
    fill: ${({ theme }) => theme.secondaryText};
  }

  [class$="path-5"],
  [class$="path-6"],
  [class$="path-8"],
  [class$="path-9"],
  [class$="path-11"],
  [class$="path-12"] {
    fill: ${({ theme }) => theme.primaryBlue};
  }

  [class$="path-14"],
  [class$="path-15"] {
    fill: ${({ theme }) => theme.secondaryPurple};
  }
`;

const WhatDoINeed: React.FC = () => <StyledImage as={StyledWhatDoINeedSvg} />;

export default WhatDoINeed;
