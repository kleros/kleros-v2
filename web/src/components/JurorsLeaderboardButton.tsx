import React from "react";

import RankingIcon from "svgs/icons/ranking.svg";

import { BlueIconTextButtonContainer } from "./BlueIconTextButtonContainer";
import { InternalLink } from "./InternalLink";

const JurorsLeaderboardButton: React.FC = () => {
  return (
    <InternalLink to={"/jurors/1/desc/all"}>
      <BlueIconTextButtonContainer>
        <RankingIcon />
        Jurors Leaderboard
      </BlueIconTextButtonContainer>
    </InternalLink>
  );
};

export default JurorsLeaderboardButton;
