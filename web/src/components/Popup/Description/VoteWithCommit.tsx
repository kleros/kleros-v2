import React from "react";

import { VoteDescriptionEmphasizedDate } from "components/Popup";

interface IVoteWithCommit {
  date?: string;
  automaticVoteReveal?: boolean;
}

const VoteWithCommit: React.FC<IVoteWithCommit> = ({ date, automaticVoteReveal = false }) =>
  automaticVoteReveal ? (
    <div>Your vote is confirmed. It's kept secret until all jurors have cast their votes.</div>
  ) : (
    <div>
      Your vote is confirmed. It's kept secret until all jurors have cast their votes.
      <VoteDescriptionEmphasizedDate>
        You'll need to justify and reveal your vote on {date}
      </VoteDescriptionEmphasizedDate>
    </div>
  );

export default VoteWithCommit;
