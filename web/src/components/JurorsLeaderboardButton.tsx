import React from "react";

import { useTranslation } from "react-i18next";

import RankingIcon from "svgs/icons/ranking.svg";

import { BlueIconTextButtonContainer } from "./BlueIconTextButtonContainer";
import { InternalLink } from "./InternalLink";

const JurorsLeaderboardButton: React.FC = () => {
  const { t } = useTranslation();

  return (
    <InternalLink to={"/jurors/1/desc/all"}>
      <BlueIconTextButtonContainer>
        <RankingIcon />
        <label>{t("misc.jurors_leaderboard")}</label>
      </BlueIconTextButtonContainer>
    </InternalLink>
  );
};

export default JurorsLeaderboardButton;
