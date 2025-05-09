import React from "react";
import styled from "styled-components";

import { responsiveSize } from "styles/responsiveSize";
import Search from "./Search";
import DisplayJurors from "./DisplayJurors";

const Container = styled.div`
  margin-top: ${responsiveSize(28, 48)};
  max-width: 578px;
`;

const Title = styled.h1`
  margin-bottom: ${responsiveSize(12, 16)};
  font-size: ${responsiveSize(20, 24)};
`;

const JurorsStakedByCourt: React.FC<{ courtName: string | undefined }> = ({ courtName }) => {
  return (
    <Container>
      <Title>
        Jurors Staked in {courtName}
        {courtName?.toLowerCase().endsWith("court") || courtName?.toLowerCase().startsWith("corte") ? null : " Court"}
      </Title>
      <Search />
      <DisplayJurors />
    </Container>
  );
};

export default JurorsStakedByCourt;
