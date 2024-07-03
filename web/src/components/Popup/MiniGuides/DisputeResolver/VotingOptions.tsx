import React from "react";
import styled from "styled-components";

import VotingOptionsSvg from "svgs/mini-guides/dispute-resolver/voting-options.svg";

import { StyledImage } from "../PageContentsTemplate";

const StyledVotingOptionsSvg = styled(VotingOptionsSvg)`
  [class$="rect-1"] {
    fill: ${({ theme }) => theme.whiteBackground};
  }
  [class$="rect-2"],
  [class$="rect-3"],
  [class$="rect-4"],
  [class$="rect-5"] {
    stroke: ${({ theme }) => theme.stroke};
    fill: ${({ theme }) => theme.whiteBackground};
  }
  [class$="circle-1"],
  [class$="circle-2"],
  [class$="path-8"] {
    fill: ${({ theme }) => theme.primaryBlue};
  }
  [class$="path-1"],
  [class$="path-3"],
  [class$="path-5"],
  [class$="path-7"] {
    fill: ${({ theme }) => theme.primaryText};
  }
  [class$="path-2"],
  [class$="path-4"],
  [class$="path-6"],
  [class$="path-9"] {
    fill: ${({ theme }) => theme.secondaryText};
  }
`;

const VotingOptions: React.FC = () => <StyledImage as={StyledVotingOptionsSvg} />;

export default VotingOptions;
