import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Tabs } from "@kleros/ui-components-library";
import { useVotingHistory } from "queries/useVotingHistory";
import { useDisputeTemplate } from "queries/useDisputeTemplate";
import { getLocalRounds } from "utils/getLocalRounds";
import PendingVotesBox from "./PendingVotesBox";
import { getDrawnJurorsWithCount } from "utils/getDrawnJurorsWithCount";
import { useDisputeDetailsQuery } from "hooks/queries/useDisputeDetailsQuery";
import VotesAccordion from "./VotesAccordion";
import Skeleton from "react-loading-skeleton";

const Container = styled.div``;

const StyledTabs = styled(Tabs)`
  width: 100%;
  margin-bottom: 16px;
`;

const VotingHistory: React.FC<{ arbitrable?: `0x${string}`; isQuestion: boolean }> = ({ arbitrable, isQuestion }) => {
  const { id } = useParams();
  const { data: votingHistory } = useVotingHistory(id);
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const [currentTab, setCurrentTab] = useState(0);
  const { data: disputeTemplate } = useDisputeTemplate(id, arbitrable);
  const rounds = votingHistory?.dispute?.rounds;

  const localRounds = getLocalRounds(votingHistory?.dispute?.disputeKitDispute);
  const answers = disputeTemplate?.answers;
  const drawnJurors = useMemo(
    () => getDrawnJurorsWithCount(votingHistory?.dispute?.rounds.at(currentTab)?.drawnJurors ?? []),
    [votingHistory, currentTab]
  );

  return (
    <Container>
      <h1>Voting History</h1>
      {rounds && localRounds && disputeTemplate ? (
        <>
          {isQuestion && disputeTemplate.question ? (
            <ReactMarkdown>{disputeTemplate.question}</ReactMarkdown>
          ) : (
            <ReactMarkdown>{"The dispute's template is not correct please vote refuse to arbitrate"}</ReactMarkdown>
          )}
          <StyledTabs
            currentValue={currentTab}
            items={rounds.map((_, i) => ({
              text: `Round ${i + 1}`,
              value: i,
            }))}
            callback={(i: number) => setCurrentTab(i)}
          />
          <PendingVotesBox
            current={localRounds.at(currentTab)?.totalVoted}
            total={rounds.at(currentTab)?.nbVotes}
            court={rounds.at(currentTab)?.court.name ?? ""}
          />
          <VotesAccordion drawnJurors={drawnJurors} period={disputeData?.dispute?.period} answers={answers} />
        </>
      ) : (
        <Skeleton height={140} />
      )}
    </Container>
  );
};

export default VotingHistory;
