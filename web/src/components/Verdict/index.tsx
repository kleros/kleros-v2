import React from "react";

import { Address } from "viem";

import { VotingHistoryQuery } from "src/graphql/graphql";

import DisputeTimeline from "./DisputeTimeline";
import FinalDecision from "./FinalDecision";

interface IVerdict {
  arbitrable?: Address;
  votingHistory: VotingHistoryQuery | undefined;
}

const Verdict: React.FC<IVerdict> = ({ arbitrable, votingHistory }) => {
  return (
    <div className="flex flex-wrap gap-[calc(16px_+_(24_-_16)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
      <FinalDecision {...{ votingHistory, arbitrable }} />
      <DisputeTimeline {...{ arbitrable }} />
    </div>
  );
};

export default Verdict;
