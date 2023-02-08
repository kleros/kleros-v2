import React from "react";
import { useParams } from "react-router-dom";
import { useWeb3 } from "hooks/useWeb3";
import { useDrawQuery } from "queries/useDrawQuery";
import Binary from "./Binary";
import VotingHistory from "./VotingHistory";
import { Periods } from "consts/periods";

const Voting: React.FC<{
  arbitrable?: string;
  currentPeriodIndex?: number;
}> = ({ arbitrable, currentPeriodIndex }) => {
  const { account } = useWeb3();
  const { id } = useParams();
  const { data } = useDrawQuery(account?.toLowerCase(), id);
  return data &&
    currentPeriodIndex === Periods.vote &&
    data.draws?.length > 0 ? (
    <Binary
      {...{ arbitrable }}
      voteIDs={data.draws.map((draw) => draw.voteID)}
    />
  ) : (
    <VotingHistory {...{ arbitrable }} />
  );
};

export default Voting;
