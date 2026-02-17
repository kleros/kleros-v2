import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import RoundIcon from "svgs/icons/round.svg";

const Container = styled.div`
  display: flex;
  gap: 8px;

  small {
    font-weight: 400;
  }
`;

interface IRound {
  number: string;
}

const Round: React.FC<IRound> = ({ number }) => {
  const { t } = useTranslation();

  return (
    <Container>
      <RoundIcon />
      <small>{t("voting.round_number", { number })}</small>
    </Container>
  );
};
export default Round;
