import React from "react";
import VoteDescriptionEmphasizedDate from "components/Popup";

interface IVoteWithCommit {
  date: string;
}

const VoteWithCommit: React.FC<IVoteWithCommit> = ({ date }) => {
  return (
    <>
      Your vote is confirmed. It's kept secret until all jurors have cast their votes.
      <VoteDescriptionEmphasizedDate>
        You'll need to justify and reveal your vote on {date}
      </VoteDescriptionEmphasizedDate>
    </>
  );
};
export default VoteWithCommit;
