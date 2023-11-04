import React from "react";
import styled from "styled-components";
import CourtHeaderSvg from "tsx:assets/svgs/mini-guides/staking/court-header.svg";
import { StyledImage } from "../PageContentsTemplate";

const StyledCourtHeaderSvg = styled(CourtHeaderSvg)`
  [class$="circle-1"] {
    fill: ${({ theme }) => theme.successLight};
  }

  [class$="circle-2"],
  [class$="circle-3"],
  [class$="circle-4"] {
    fill: ${({ theme }) => theme.mediumPurple};
  }

  [class$="line-1"],
  [class$="line-2"] {
    stroke: ${({ theme }) => theme.stroke};
  }

  [class$="rect-1"],
  [class$="rect-5"],
  [class$="path-2"],
  [class$="rect-3"] {
    fill: ${({ theme }) => theme.whiteBackground};
  }

  [class$="rect-2"],
  [class$="rect-3"] {
    stroke: ${({ theme }) => theme.stroke};
  }

  [class$="rect-4"],
  [class$="path-3"] {
    fill: ${({ theme }) => theme.primaryBlue};
  }

  [class$="rect-7"],
  [class$="rect-8"],
  [class$="rect-9"],
  [class$="rect-10"],
  [class$="rect-11"],
  [class$="rect-12"],
  [class$="rect-13"] {
    fill: ${({ theme }) => theme.white};
  }

  [class$="rect-6"] {
    stroke: ${({ theme }) => theme.primaryBlue};
  }

  [class$="path-4"],
  [class$="path-5"],
  [class$="path-8"],
  [class$="path-11"],
  [class$="path-14"],
  [class$="path-21"],
  [class$="path-22"],
  [class$="path-23"],
  [class$="path-26"],
  [class$="path-29"],
  [class$="path-32"] {
    fill: ${({ theme }) => theme.primaryText};
  }

  [class$="path-1"],
  [class$="path-7"],
  [class$="path-10"],
  [class$="path-13"],
  [class$="path-15"],
  [class$="path-16"],
  [class$="path-17"],
  [class$="path-18"],
  [class$="path-19"],
  [class$="path-20"],
  [class$="path-24"],
  [class$="path-25"],
  [class$="path-27"],
  [class$="path-28"],
  [class$="path-30"],
  [class$="path-31"],
  [class$="path-33"],
  [class$="path-34"] {
    fill: ${({ theme }) => theme.secondaryText};
  }

  [class$="path-6"],
  [class$="path-9"],
  [class$="path-12"],
  [class$="path-36"],
  [class$="path-37"],
  [class$="path-38"],
  [class$="path-39"],
  [class$="path-40"],
  [class$="path-41"],
  [class$="path-42"],
  [class$="path-43"],
  [class$="path-44"],
  [class$="path-45"] {
    fill: ${({ theme }) => theme.secondaryPurple};
  }

  [class$="path-35"] {
    fill: ${({ theme }) => theme.success};
  }
`;

const CourtHeader: React.FC = () => <StyledImage as={StyledCourtHeaderSvg} />;

export default CourtHeader;
