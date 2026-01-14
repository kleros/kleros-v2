import React from "react";

import { useTranslation } from "react-i18next";

import { encodeURIFilter } from "utils/uri";

import { BlueIconTextButtonContainer } from "./BlueIconTextButtonContainer";
import { InternalLink } from "./InternalLink";

interface ISeeAllCasesButton {
  courtId?: string;
}

const SeeAllCasesButton: React.FC<ISeeAllCasesButton> = ({ courtId }) => {
  const { t } = useTranslation();
  const filter = courtId ? { court: courtId } : {};
  const link = `/cases/display/1/desc/${encodeURIFilter(filter)}`;

  return (
    <InternalLink to={link}>
      <BlueIconTextButtonContainer>{t("misc.see_all")}</BlueIconTextButtonContainer>
    </InternalLink>
  );
};

export default SeeAllCasesButton;
