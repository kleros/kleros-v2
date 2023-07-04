import React from "react";
import styled from "styled-components";
import ClosedCaseIcon from "assets/svgs/icons/check-circle-outline.svg";

const BannerContainer = styled.div`
  display: flex;
  gap: 8px;
  margin: 16px 0px;
  svg {
    width: 16px;
    height: 16px;
  }
`;

const VerdictTag = styled.small`
  font-weight: 400;
  line-height: 19px;
  color: ${({ theme }) => theme.success};
`;

const VerdictBanner: React.FC = () => {
  return (
    <BannerContainer>
      <ClosedCaseIcon />
      <VerdictTag>Case closed</VerdictTag>
    </BannerContainer>
  );
};

export default VerdictBanner;
