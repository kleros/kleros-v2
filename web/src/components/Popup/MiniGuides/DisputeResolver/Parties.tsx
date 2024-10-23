import React from "react";
import styled from "styled-components";

import PartiesSvg from "svgs/mini-guides/dispute-resolver/parties.svg";

import { StyledImage } from "../PageContentsTemplate";

const StyledPartiesSvg = styled(PartiesSvg)`
  [class$="rect-1"] {
    fill: ${({ theme }) => theme.whiteBackground};
  }
  [class$="rect-2"],
  [class$="rect-3"],
  [class$="rect-4"],
  [class$="rect-5"],
  [class$="rect-6"] {
    stroke: ${({ theme }) => theme.stroke};
    fill: ${({ theme }) => theme.whiteBackground};
  }
  [class$="path-1"],
  [class$="path-3"],
  [class$="path-5"],
  [class$="path-7"] {
    fill: ${({ theme }) => theme.secondaryText};
  }
  [class$="path-2"],
  [class$="path-4"],
  [class$="path-6"],
  [class$="path-8"] {
    fill: ${({ theme }) => theme.primaryText};
  }
`;

const Parties: React.FC = () => <StyledImage as={StyledPartiesSvg} />;

export default Parties;
