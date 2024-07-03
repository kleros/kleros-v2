import React from "react";
import styled from "styled-components";

import ParametersSvg from "svgs/mini-guides/dispute-resolver/parameters.svg";

import { StyledImage } from "../PageContentsTemplate";

const StyledParametersSvg = styled(ParametersSvg)`
  [class$="rect-1"],
  [class$="rect-3"],
  [class$="rect-7"],
  [class$="path-3"] {
    fill: ${({ theme }) => theme.whiteBackground};
  }
  [class$="rect-2"],
  [class$="rect-6"],
  [class$="rect-8"] {
    stroke: ${({ theme }) => theme.stroke};
  }
  [class$="rect-4"] {
    stroke: ${({ theme }) => theme.primaryBlue};
  }
  [class$="rect-5"],
  [class$="path-2"] {
    fill: ${({ theme }) => theme.primaryBlue};
  }
  [class$="path-1"],
  [class$="path-4"],
  [class$="path-7"],
  [class$="path-8"] {
    fill: ${({ theme }) => theme.primaryText};
  }
  [class$="path-5"] {
    fill: ${({ theme }) => theme.stroke};
  }
  [class$="path-6"] {
    fill: ${({ theme }) => theme.secondaryPurple};
  }
`;

const Parameters: React.FC = () => <StyledImage as={StyledParametersSvg} />;

export default Parameters;
