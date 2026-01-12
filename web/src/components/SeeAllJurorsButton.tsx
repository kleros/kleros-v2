import React from "react";

import { useTranslation } from "react-i18next";

import { BlueIconTextButtonContainer } from "./BlueIconTextButtonContainer";
import { InternalLink } from "./InternalLink";

const SeeAllJurorsButton: React.FC = () => {
  const { t } = useTranslation();

  return (
    <InternalLink to={"/jurors/1/desc/all"}>
      <BlueIconTextButtonContainer>
        <label>{t("misc.see_all")}</label>
      </BlueIconTextButtonContainer>
    </InternalLink>
  );
};

export default SeeAllJurorsButton;
