import React from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div`
  display: flex;
  width: 100%;
  background-color: ${({ theme }) => theme.lightBlue};
  border: 1px solid ${({ theme }) => theme.stroke};
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  padding: 16px;
  margin-top: ${responsiveSize(12, 16)};

  ${landscapeStyle(
    () => css`
      display: none;
    `
  )}
`;

const StyledLabel = styled.label`
  font-size: 14px;
  color: ${({ theme }) => theme.secondaryText};
`;

export const MobileHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <StyledLabel>{t("profile.staking_history")}</StyledLabel>
    </Container>
  );
};
