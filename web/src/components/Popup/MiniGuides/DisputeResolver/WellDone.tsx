import React from "react";
import styled from "styled-components";

import WellDoneSvg from "svgs/mini-guides/dispute-resolver/well-done.svg";

import { StyledImage } from "../PageContentsTemplate";

const StyledWellDoneSvg = styled(WellDoneSvg)`
  [class$="rect-1"] {
    fill: ${({ theme }) => theme.whiteBackground};
  }
  [class$="rect-2"],
  [class$="rect-3"],
  [class$="line-1"],
  [class$="line-2"] {
    stroke: ${({ theme }) => theme.stroke};
  }
  [class$="circle-1"] {
    fill: ${({ theme }) => theme.primaryPurple};
  }
  [class$="path-1"],
  [class$="path-2"],
  [class$="path-4"],
  [class$="path-5"],
  [class$="path-7"],
  [class$="path-9"],
  [class$="path-11"],
  [class$="path-15"],
  [class$="path-18"],
  [class$="path-21"] {
    fill: ${({ theme }) => theme.primaryText};
  }
  [class$="path-3"],
  [class$="path-6"],
  [class$="path-8"],
  [class$="path-10"],
  [class$="path-12"],
  [class$="path-14"],
  [class$="path-17"],
  [class$="path-20"] {
    fill: ${({ theme }) => theme.secondaryText};
  }
  [class$="path-13"],
  [class$="path-16"],
  [class$="path-19"] {
    fill: ${({ theme }) => theme.secondaryPurple};
  }
`;

const WellDone: React.FC = () => <StyledImage as={StyledWellDoneSvg} />;

export default WellDone;
