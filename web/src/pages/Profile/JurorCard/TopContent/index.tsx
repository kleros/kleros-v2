import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import JurorLink from "components/JurorLink";

const Container = styled.div`
  display: flex;
  flex-direction: row
  align-items: center;
  gap: 16px 24px;
  flex-wrap: wrap;
`;

const StyledLabel = styled.label`
  font-size: 14px;
`;

interface ITopContent {
  address: `0x${string}`;
  totalResolvedDisputes: number;
}

const TopContent: React.FC<ITopContent> = ({ address, totalResolvedDisputes }) => {
  const { t } = useTranslation();

  return (
    <Container>
      <JurorLink {...{ address }} isInternalLink={false} />
      {totalResolvedDisputes > 0 ? (
        <StyledLabel>{t("profile.juror_in_cases", { count: totalResolvedDisputes })}</StyledLabel>
      ) : null}
    </Container>
  );
};
export default TopContent;
