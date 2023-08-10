import React from "react";
import { VoteDescriptionEmphasizedDate } from "components/Popup";

interface IVoteWithoutCommit {
  date: string;
}

const VoteWithoutCommit: React.FC<IVoteWithoutCommit> = ({ date }) => {
  return (
    <div>
      The decision date is <VoteDescriptionEmphasizedDate>{date}</VoteDescriptionEmphasizedDate> with the possibility
      for appeals. After that time you will be informed about the jury decision.
    </div>
  );
};
export default VoteWithoutCommit;
