import React from "react";

import { useTranslation } from "react-i18next";

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="inline-flex gap-2">
    <label className="text-klerosUIComponentsPrimaryText">{label}</label>
    <small>{value}</small>
  </div>
);

const Separator: React.FC = () => <label className="m-[0_8px] text-klerosUIComponentsPrimaryText">|</label>;

export interface IStats {
  totalVotes: number;
  votesPending: number;
  resolvedVotes: number;
}

const Stats: React.FC<IStats> = ({ totalVotes, votesPending, resolvedVotes }) => {
  const { t } = useTranslation();
  const casesInProgress = (totalVotes - resolvedVotes).toString();

  const fields = [
    { label: t("profile.total"), value: totalVotes.toString() },
    { label: t("profile.vote_pending"), value: votesPending.toString() },
    { label: t("profile.case_in_progress"), value: casesInProgress },
    { label: t("profile.resolved"), value: resolvedVotes.toString() },
  ];

  return (
    <div>
      {fields.map(({ label, value }, i) => (
        <React.Fragment key={i}>
          <Field {...{ label, value }} />
          {i + 1 < fields.length ? <Separator /> : null}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Stats;
