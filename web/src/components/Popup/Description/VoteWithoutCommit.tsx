import React from "react";

import { Trans } from "react-i18next";

import { VoteDescriptionEmphasizedDate } from "components/Popup";

interface IVoteWithoutCommit {
  date: string;
}

const VoteWithoutCommit: React.FC<IVoteWithoutCommit> = ({ date }) => {
  return (
    <div>
      <Trans
        i18nKey="popups.decision_date_with_appeals"
        values={{ date }}
        components={{ emphasized: <VoteDescriptionEmphasizedDate /> }}
      />
    </div>
  );
};
export default VoteWithoutCommit;
