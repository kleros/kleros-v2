import React from "react";
import styled from "styled-components";
import CrowdfundAppealSvg from "tsx:assets/svgs/mini-guides/appeal/crowdfund-appeal.svg";
import { StyledImage } from "../PageContentsTemplate";

const StyledCrowdfundAppealSvg = styled(CrowdfundAppealSvg)`
  [class$="rect-bg"] {
    fill: ${({ theme }) => theme.whiteBackground};
    stroke: ${({ theme }) => theme.stroke};
  }

  [class$="path-1"],
  [class$="path-2"],
  [class$="path-3"] {
    fill: ${({ theme }) => theme.primaryText};
  }

  [class$="rect-fg"] {
    fill: ${({ theme }) => theme.whiteBackground};
    stroke: ${({ theme }) => theme.stroke};
  }

  [class$="rect-accent"] {
    fill: ${({ theme }) => theme.primaryBlue};
  }

  [class$="path-4"] {
    fill: ${({ theme }) => theme.whiteBackground};
  }

  [class$="path-5"] {
    fill: ${({ theme }) => theme.secondaryText};
  }
`;

const CrowdfundAppeal: React.FC = () => <StyledImage as={StyledCrowdfundAppealSvg} />;

export default CrowdfundAppeal;
