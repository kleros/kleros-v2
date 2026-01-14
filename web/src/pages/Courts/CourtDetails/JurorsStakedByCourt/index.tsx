import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import { getDescriptiveCourtName } from "utils/getDescriptiveCourtName";

import { responsiveSize } from "styles/responsiveSize";

import DisplayJurors from "./DisplayJurors";
import Search from "./Search";

const Container = styled.div`
  max-width: 578px;
`;

const Title = styled.h1`
  margin-bottom: ${responsiveSize(12, 16)};
  font-size: ${responsiveSize(20, 24)};
`;

const JurorsStakedByCourt: React.FC<{ courtName: string | undefined }> = ({ courtName }) => {
  const { t } = useTranslation();
  return (
    <Container>
      <Title>
        {t("misc.jurors_staked_in")} {getDescriptiveCourtName(courtName)}
      </Title>
      <Search />
      <DisplayJurors />
    </Container>
  );
};

export default JurorsStakedByCourt;
