import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import { getDescriptiveCourtName } from "utils/getDescriptiveCourtName";

import { responsiveSize } from "styles/responsiveSize";

import DisplayStakes from "./DisplayStakes";
import Search from "./Search";

const Container = styled.div`
  max-width: 578px;
`;

const Title = styled.h1`
  margin-bottom: ${responsiveSize(12, 16)};
  font-size: ${responsiveSize(20, 24)};
`;

const StakingHistoryByCourt: React.FC<{ courtName: string | undefined }> = ({ courtName }) => {
  const { t } = useTranslation();

  return (
    <Container>
      <Title>
        {t("profile.staking_history_in")} {getDescriptiveCourtName(courtName)}
      </Title>
      <Search />
      <DisplayStakes />
    </Container>
  );
};

export default StakingHistoryByCourt;
