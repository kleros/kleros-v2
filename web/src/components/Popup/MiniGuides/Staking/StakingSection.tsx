import React from "react";
import styled from "styled-components";
import StakingSectionSvg from "tsx:assets/svgs/mini-guides/staking/staking-section.svg";
import { StyledImage } from "../PageContentsTemplate";

const StyledStakingSectionSvg = styled(StakingSectionSvg)`
  [class$="rect-1"],
  [class$="path-2"] {
    fill: ${({ theme }) => theme.whiteBackground};
  }

  [class$="rect-2"],
  [class$="rect-3"] {
    stroke: ${({ theme }) => theme.stroke};
  }

  [class$="rect-3"] {
    fill: ${({ theme }) => theme.whiteBackground};
  }

  [class$="rect-4"] {
    fill: ${({ theme }) => theme.primaryBlue};
  }

  [class$="rect-5"],
  [class$="rect-6"] {
    fill: ${({ theme }) => theme.white};
  }

  [class$="path-1"],
  [class$="path-6"],
  [class$="path-9"] {
    fill: ${({ theme }) => theme.secondaryText};
  }

  [class$="path-3"],
  [class$="path-4"],
  [class$="path-7"],
  [class$="path-10"] {
    fill: ${({ theme }) => theme.primaryText};
  }

  [class$="path-5"],
  [class$="path-8"] {
    fill: ${({ theme }) => theme.secondaryPurple};
  }
`;

const StakingSection: React.FC = () => <StyledImage as={StyledStakingSectionSvg} />;

export default StakingSection;
