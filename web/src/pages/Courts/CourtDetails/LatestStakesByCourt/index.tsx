import React from "react";
import styled from "styled-components";

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

const LatestStakesByCourt: React.FC<{ courtName: string | undefined }> = ({ courtName }) => {
  return (
    <Container>
      <Title>Latest Stakes in {getDescriptiveCourtName(courtName)}</Title>
      <Search />
      <DisplayStakes />
    </Container>
  );
};

export default LatestStakesByCourt;
