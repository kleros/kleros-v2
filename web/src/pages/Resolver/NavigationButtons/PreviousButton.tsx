import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Button } from "@kleros/ui-components-library";

import { isEmpty } from "src/utils";

interface IReturnButton {
  prevRoute: string;
}

const ReturnButton: React.FC<IReturnButton> = ({ prevRoute }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Button
      className={isEmpty(prevRoute) ? "hidden" : "flex"}
      onPress={() => navigate(prevRoute)}
      text={t("buttons.return")}
      variant="secondary"
    ></Button>
  );
};

export default ReturnButton;
