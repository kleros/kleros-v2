import React from "react";
import styled from "styled-components";

import WhoWinsRewardsSvg from "svgs/mini-guides/appeal/who-wins-rewards.svg";

import { StyledImage } from "../PageContentsTemplate";

const StyledWhoWinsRewardsSvg = styled(WhoWinsRewardsSvg)`
  [class$="path-1"] {
    fill: ${({ theme }) => theme.lightBlue};
    stroke: ${({ theme }) => theme.mediumBlue};
  }
  [class$="path-2"],
  [class$="path-19"],
  [class$="path-20"] {
    fill: ${({ theme }) => theme.primaryText};
  }
  [class$="path-3"],
  [class$="path-7"],
  [class$="path-8"],
  [class$="path-9"],
  [class$="path-10"] {
    fill: ${({ theme }) => theme.success};
  }
  [class$="path-4"],
  [class$="path-5"],
  [class$="path-6"],
  [class$="path-12"],
  [class$="path-13"],
  [class$="path-14"] {
    fill: ${({ theme }) => theme.tint};
  }
  [class$="path-11"],
  [class$="path-15"],
  [class$="path-16"],
  [class$="path-17"],
  [class$="path-18"] {
    fill: ${({ theme }) => theme.error};
  }
  [class$="line-1"],
  [class$="line-2"] {
    stroke: ${({ theme }) => theme.mediumBlue};
  }
  [class$="rect-1"],
  [class$="rect-2"] {
    fill: ${({ theme }) => theme.tintMedium};
  }
`;

const WhoWinsRewards: React.FC = () => <StyledImage as={StyledWhoWinsRewardsSvg} />;

export default WhoWinsRewards;
