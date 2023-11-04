import React from "react";
import styled from "styled-components";
import HowItWorksSvg from "tsx:assets/svgs/mini-guides/onboarding/how-it-works.svg";
import ImageRenderer from "../ImageRenderer";

const StyledHowItWorksSvg = styled(HowItWorksSvg)`
  [class$="rect-1"],
  [class$="rect-3"] {
    fill: ${({ theme }) => theme.whiteBackground};
  }

  [class$="path-1"],
  [class$="path-2"] {
    fill: ${({ theme }) => theme.secondaryPurple};
  }

  [class$="rect-2"] {
    stroke: ${({ theme }) => theme.stroke};
  }
`;

const HowItWorks: React.FC = () => <ImageRenderer image={StyledHowItWorksSvg} />;

export default HowItWorks;
