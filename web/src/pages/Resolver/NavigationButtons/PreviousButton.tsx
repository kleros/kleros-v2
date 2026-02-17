import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Button } from "@kleros/ui-components-library";

import { isEmpty } from "src/utils";

const StyledButton = styled(Button)<{ prevRoute: string }>`
  display: ${({ prevRoute }) => (isEmpty(prevRoute) ? "none" : "flex")};
`;

interface IReturnButton {
  prevRoute: string;
}

const ReturnButton: React.FC<IReturnButton> = ({ prevRoute }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <StyledButton
      prevRoute={prevRoute}
      onClick={() => navigate(prevRoute)}
      text={t("buttons.return")}
      variant="secondary"
    ></StyledButton>
  );
};

export default ReturnButton;
