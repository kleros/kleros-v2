import React from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";

import { landscapeStyle } from "styles/landscapeStyle";

import { InternalLink } from "components/InternalLink";

const Container = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  gap: 8px 16px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;

  small {
    height: 100%;
    font-weight: 600;
  }

  ${landscapeStyle(
    () => css`
      justify-content: flex-start;
      width: auto;
    `
  )}
`;

const StyledInternalLink = styled(InternalLink)`
  font-weight: 600;
`;

interface ICaseNumber {
  id: string;
}

const CaseNumber: React.FC<ICaseNumber> = ({ id }) => {
  const { t } = useTranslation();

  return (
    <Container>
      <StyledInternalLink to={`/cases/${id?.toString()}`}>
        {t("misc.case")} {id}
      </StyledInternalLink>
    </Container>
  );
};
export default CaseNumber;
