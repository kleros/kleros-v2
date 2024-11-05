import React from "react";
import styled from "styled-components";

import PolicySvg from "svgs/mini-guides/dispute-resolver/policy.svg";

import { StyledImage } from "../PageContentsTemplate";

const StyledPolicySvg = styled(PolicySvg)`
  [class$="rect-1"] {
    fill: ${({ theme }) => theme.whiteBackground};
  }
  [class$="rect-2"] {
    stroke: ${({ theme }) => theme.stroke};
  }
  [class$="rect-3"] {
    fill: ${({ theme }) => theme.mediumBlue};
    stroke: ${({ theme }) => theme.primaryBlue};
  }
  [class$="path-1"],
  [class$="path-3"] {
    fill: ${({ theme }) => theme.primaryText};
  }
  [class$="path-2"],
  [class$="path-4"] {
    fill: ${({ theme }) => theme.primaryBlue};
  }
`;

const Policy: React.FC = () => <StyledImage as={StyledPolicySvg} />;

export default Policy;
