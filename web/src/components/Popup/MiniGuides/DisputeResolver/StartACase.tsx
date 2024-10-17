import React from "react";
import styled from "styled-components";

import StartACaseSvg from "svgs/mini-guides/dispute-resolver/start-a-case.svg";

import { StyledImage } from "../PageContentsTemplate";

const StyledStartACaseSvg = styled(StartACaseSvg)`
  [class$="rect-1"],
  [class$="path-1"] {
    fill: ${({ theme }) => theme.whiteBackground};
  }
  [class$="rect-2"],
  [class$="circle-2"],
  [class$="circle-3"],
  [class$="circle-4"],
  [class$="path-12"],
  [class$="path-13"] {
    stroke: ${({ theme }) => theme.stroke};
  }
  [class$="circle-1"],
  [class$="path-11"] {
    stroke: ${({ theme }) => theme.primaryBlue};
    fill: ${({ theme }) => theme.primaryBlue};
  }
  [class$="circle-2"],
  [class$="circle-3"],
  [class$="circle-4"] {
    fill: ${({ theme }) => theme.whiteBackground};
  }
  [class$="path-2"],
  [class$="path-18"] {
    fill: ${({ theme }) => theme.primaryText};
  }
  [class$="path-3"],
  [class$="path-5"],
  [class$="path-6"],
  [class$="path-7"],
  [class$="path-8"],
  [class$="path-9"],
  [class$="path-10"],
  [class$="path-15"],
  [class$="path-17"] {
    fill: ${({ theme }) => theme.secondaryText};
  }
  [class$="path-4"],
  [class$="path-14"],
  [class$="path-16"] {
    fill: ${({ theme }) => theme.stroke};
  }
`;

const StartACase: React.FC = () => <StyledImage as={StyledStartACaseSvg} />;

export default StartACase;
