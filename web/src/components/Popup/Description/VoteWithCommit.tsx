import React from "react";

import { useTranslation } from "react-i18next";

import { VoteDescriptionEmphasizedDate } from "components/Popup";

interface IVoteWithCommit {
  date?: string;
  automaticVoteReveal?: boolean;
}

const VoteWithCommit: React.FC<IVoteWithCommit> = ({ date, automaticVoteReveal = false }) => {
  const { t } = useTranslation();

  return automaticVoteReveal ? (
    <div>{t("popups.vote_confirmed_secret")}</div>
  ) : (
    <div>
      {t("popups.vote_confirmed_secret")}
      <VoteDescriptionEmphasizedDate>{t("popups.justify_reveal_vote_on", { date })}</VoteDescriptionEmphasizedDate>
    </div>
  );
};

export default VoteWithCommit;
