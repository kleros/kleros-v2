import React from "react";
import styled from "styled-components";
import JurorRewardsSvg from "tsx:assets/svgs/mini-guides/staking/juror-rewards.svg";
import { StyledImage } from "../PageContentsTemplate";

const StyledJurorRewardsSvg = styled(JurorRewardsSvg)`
  [class$="rect-1"] {
    fill: ${({ theme }) => theme.whiteBackground};
  }
  [class$="rect-2"],
  [class$="path-2"] {
    stroke: ${({ theme }) => theme.stroke};
  }
  [class$="rect-3"],
  [class$="rect-4"],
  [class$="rect-5"],
  [class$="rect-6"],
  [class$="rect-7"],
  [class$="mask-1"] {
    fill: ${({ theme }) => theme.white};
  }
  [class$="stop-1"],
  [class$="stop-4"],
  [class$="stop-6"] {
    stop-color: ${({ theme }) => theme.secondaryPurple};
  }
  [class$="stop-2"],
  [class$="stop-3"],
  [class$="stop-5"] {
    stop-color: ${({ theme }) => theme.primaryBlue};
  }
  [class$="path-3"] {
    fill: ${({ theme }) => theme.primaryBlue};
  }
  [class$="path-5"],
  [class$="path-6"],
  [class$="path-9"],
  [class$="path-13"],
  [class$="path-14"] {
    fill: ${({ theme }) => theme.primaryText};
  }
  [class$="path-7"],
  [class$="path-8"],
  [class$="path-10"],
  [class$="path-11"],
  [class$="path-12"] {
    fill: ${({ theme }) => theme.secondaryText};
  }
`;

const JurorRewards: React.FC = () => <StyledImage as={StyledJurorRewardsSvg} />;

export default JurorRewards;
