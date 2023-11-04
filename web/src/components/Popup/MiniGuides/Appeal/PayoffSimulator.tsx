import React from "react";
import styled from "styled-components";
import PayoffSimulatorSvg from "tsx:assets/svgs/mini-guides/appeal/payoff-simulator.svg";
import { StyledImage } from "../PageContentsTemplate";

const StyledPayoffSimulatorSvg = styled(PayoffSimulatorSvg)`
  [class$="circle-1"] {
    fill: ${({ theme }) => theme.successLight};
  }

  [class$="rect-2"] {
    fill: ${({ theme }) => theme.mediumBlue};
  }

  [class$="circle-2"] {
    fill: ${({ theme }) => theme.mediumPurple};
  }

  [class$="rect-1"],
  [class$="rect-5"] {
    fill: ${({ theme }) => theme.whiteBackground};
    stroke: ${({ theme }) => theme.stroke};
  }

  [class$="rect-6"],
  [class$="rect-7"],
  [class$="rect-8"] {
    fill: ${({ theme }) => theme.white};
  }

  [class$="path-2"] {
    fill: ${({ theme }) => theme.success};
  }

  [class$="path-3"],
  [class$="path-16"] {
    fill: ${({ theme }) => theme.secondaryPurple};
  }

  [class$="path-11"],
  [class$="path-13"] {
    fill: ${({ theme }) => theme.whiteBackground};
  }

  [class$="path-4"],
  [class$="path-5"],
  [class$="path-6"],
  [class$="path-7"],
  [class$="path-8"],
  [class$="path-9"],
  [class$="path-10"],
  [class$="path-12"],
  [class$="path-14"],
  [class$="path-15"],
  [class$="path-17"] {
    fill: ${({ theme }) => theme.primaryText};
  }

  [class$="rect-3"],
  [class$="rect-4"] {
    fill: ${({ theme }) => theme.primaryBlue};
  }

  [class$="line-1"],
  [class$="line-2"],
  [class$="path-1"] {
    stroke: ${({ theme }) => theme.mediumBlue};
  }

  [class$="path-1"] {
    fill: ${({ theme }) => theme.lightBlue};
  }
`;

const PayoffSimulator: React.FC = () => <StyledImage as={StyledPayoffSimulatorSvg} />;

export default PayoffSimulator;
