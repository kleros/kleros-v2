import React from "react";
import styled from "styled-components";
import PrivateVotingSvg from "tsx:assets/svgs/mini-guides/binary-voting/private-voting.svg";
import { StyledImage } from "../PageContentsTemplate";

const StyledPrivateVotingSvg = styled(PrivateVotingSvg)`
  [class$="rect-1"] {
    fill: ${({ theme }) => theme.whiteBackground};
    stroke: ${({ theme }) => theme.stroke};
  }
  [class$="circle-1"] {
    fill: ${({ theme }) => theme.primaryBlue};
    stroke: ${({ theme }) => theme.primaryBlue};
  }
  [class$="circle-2"] {
    fill: ${({ theme }) => theme.whiteBackground};
    stroke: ${({ theme }) => theme.stroke};
  }
  [class$="circle-3"] {
    fill: ${({ theme }) => theme.primaryBlue};
    stroke: ${({ theme }) => theme.primaryBlue};
  }
  [class$="path-1"] {
    fill: ${({ theme }) => theme.secondaryText};
  }
  [class$="path-2"] {
    fill: ${({ theme }) => theme.whiteBackground};
  }
  [class$="path-3"] {
    fill: ${({ theme }) => theme.primaryText};
  }
  [class$="path-4"] {
    stroke: ${({ theme }) => theme.stroke};
  }
  [class$="path-5"] {
    fill: ${({ theme }) => theme.stroke};
  }
  [class$="path-6"] {
    fill: ${({ theme }) => theme.primaryText};
  }
  [class$="path-7"] {
    fill: ${({ theme }) => theme.secondaryText};
  }
  [class$="path-8"] {
    stroke: ${({ theme }) => theme.stroke};
  }
  [class$="path-9"] {
    fill: ${({ theme }) => theme.whiteBackground};
  }
  [class$="path-10"] {
    fill: ${({ theme }) => theme.primaryText};
  }
  [class$="path-11"] {
    stroke: ${({ theme }) => theme.stroke};
  }
`;

const PrivateVoting: React.FC = () => <StyledImage as={StyledPrivateVotingSvg} />;

export default PrivateVoting;
