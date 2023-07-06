import React from "react";
import styled from "styled-components";
import ClosedCaseIcon from "assets/svgs/icons/check-circle-outline.svg";
import HourglassIcon from "assets/svgs/icons/hourglass.svg";

const BannerContainer = styled.div`
  display: flex;
  gap: 8px;
  margin: 16px 0px;
  svg {
    width: 16px;
    height: 16px;
  }
`;

const VerdictTag = styled.small<{ ruled: boolean }>`
  font-weight: 400;
  line-height: 19px;
  color: ${({ theme, ruled }) => (ruled ? theme.success : theme.primaryText)};
`;

interface IVerdictIcon {
  ruled: boolean;
}

const VerdictIcon: React.FC<IVerdictIcon> = ({ ruled }) => {
  return ruled ? <ClosedCaseIcon /> : <HourglassIcon />;
};

interface IVerdictText {
  ruled: boolean;
}

const VerdictText: React.FC<IVerdictText> = ({ ruled }) => {
  return ruled ? <>Case closed</> : <>Case ongoing</>;
};

interface IVerdictBanner {
  ruled: boolean;
}

const VerdictBanner: React.FC<IVerdictBanner> = ({ ruled }) => {
  console.log("ruledinside verdict banner", ruled);
  return (
    <BannerContainer>
      <VerdictIcon ruled={ruled} />
      <VerdictTag ruled={ruled}>
        <VerdictText ruled={ruled} />
      </VerdictTag>
    </BannerContainer>
  );
};

export default VerdictBanner;
