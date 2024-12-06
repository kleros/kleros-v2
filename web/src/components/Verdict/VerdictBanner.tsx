import React from "react";
import styled from "styled-components";

import ClosedCaseIcon from "svgs/icons/check-circle-outline.svg";
import HourglassIcon from "svgs/icons/hourglass.svg";

const BannerContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
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

const StyledHourglassIcon = styled(HourglassIcon)`
  fill: ${({ theme }) => theme.primaryText};
`;

interface IVerdictIcon {
  ruled: boolean;
}

const VerdictIcon: React.FC<IVerdictIcon> = ({ ruled }) => {
  return ruled ? <ClosedCaseIcon /> : <StyledHourglassIcon />;
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
