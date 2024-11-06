import React from "react";
import styled from "styled-components";

import PrivateVotingSvg from "svgs/mini-guides/binary-voting/private-voting.svg";

import { StyledImage } from "../PageContentsTemplate";

const StyledPrivateVotingSvg = styled(PrivateVotingSvg)`
  [class$="rect-1"],
  [class$="circle-2"],
  [class$="path-2"],
  [class$="path-9"] {
    fill: ${({ theme }) => theme.whiteBackground};
  }
  [class$="circle-1"],
  [class$="circle-3"] {
    fill: ${({ theme }) => theme.primaryBlue};
    stroke: ${({ theme }) => theme.primaryBlue};
  }
  [class$="rect-1"],
  [class$="circle-2"],
  [class$="path-4"],
  [class$="path-8"],
  [class$="path-11"] {
    stroke: ${({ theme }) => theme.stroke};
  }
  [class$="path-1"],
  [class$="path-7"] {
    fill: ${({ theme }) => theme.secondaryText};
  }
  [class$="path-3"],
  [class$="path-6"],
  [class$="path-10"] {
    fill: ${({ theme }) => theme.primaryText};
  }
  [class$="path-5"] {
    fill: ${({ theme }) => theme.stroke};
  }
`;

const PrivateVoting: React.FC = () => <StyledImage as={StyledPrivateVotingSvg} />;

export default PrivateVoting;
