import React from "react";
import { VoteDescriptionEmphasizedDate } from "components/Popup";

interface IVoteWithCommit {
  date: string;
}

const VoteWithCommit: React.FC<IVoteWithCommit> = ({ date }) => {
  return (
    <div>
      Your vote is confirmed. It's kept secret until all jurors have cast their votes.
      <VoteDescriptionEmphasizedDate>
        You'll need to justify and reveal your vote on {date}
      </VoteDescriptionEmphasizedDate>
    </div>
  );
};
export default VoteWithCommit;
