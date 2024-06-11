import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import Skeleton from "react-loading-skeleton";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";
import { useToggle } from "react-use";

import { Tabs } from "@kleros/ui-components-library";

import { INVALID_DISPUTE_DATA_ERROR, RPC_ERROR } from "consts/index";
import { getDrawnJurorsWithCount } from "utils/getDrawnJurorsWithCount";
import { getLocalRounds } from "utils/getLocalRounds";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { usePopulatedDisputeData } from "queries/usePopulatedDisputeData";
import { useVotingHistory } from "queries/useVotingHistory";

import { responsiveSize } from "styles/responsiveSize";

import HowItWorks from "components/HowItWorks";
import BinaryVoting from "components/Popup/MiniGuides/BinaryVoting";

import PendingVotesBox from "./PendingVotesBox";
import VotesAccordion from "./VotesDetails";

const Container = styled.div``;

const StyledTabs = styled(Tabs)`
  width: 100%;
  margin-bottom: 16px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: ${responsiveSize(16, 32)};
`;

const StyledTitle = styled.h1`
  margin-bottom: 0;
`;

const VotingHistory: React.FC<{ arbitrable?: `0x${string}`; isQuestion: boolean }> = ({ arbitrable, isQuestion }) => {
  const { id } = useParams();
  const { data: votingHistory } = useVotingHistory(id);
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const [currentTab, setCurrentTab] = useState(0);
  const { data: disputeDetails, isError } = usePopulatedDisputeData(id, arbitrable);
  const rounds = votingHistory?.dispute?.rounds;
  const [isBinaryVotingMiniGuideOpen, toggleBinaryVotingMiniGuide] = useToggle(false);

  const localRounds = getLocalRounds(votingHistory?.dispute?.disputeKitDispute);
  //set current tab to latest round
  useEffect(() => setCurrentTab((rounds?.length && rounds?.length - 1) ?? 0), [rounds]);

  const answers = disputeDetails?.answers;
  const drawnJurors = useMemo(
    () => getDrawnJurorsWithCount(votingHistory?.dispute?.rounds.at(currentTab)?.drawnJurors ?? []),
    [votingHistory, currentTab]
  );

  return (
    <Container>
      <Header>
        <StyledTitle>Voting History</StyledTitle>
        <HowItWorks
          isMiniGuideOpen={isBinaryVotingMiniGuideOpen}
          toggleMiniGuide={toggleBinaryVotingMiniGuide}
          MiniGuideComponent={BinaryVoting}
        />
      </Header>
      {rounds && localRounds && disputeDetails ? (
        <>
          {isQuestion && (
            <>
              {disputeDetails.question ? (
                <ReactMarkdown>{disputeDetails.question}</ReactMarkdown>
              ) : (
                <ReactMarkdown>{isError ? RPC_ERROR : INVALID_DISPUTE_DATA_ERROR}</ReactMarkdown>
              )}
            </>
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
          <VotesAccordion
            drawnJurors={drawnJurors}
            period={disputeData?.dispute?.period}
            answers={answers}
            isActiveRound={localRounds?.length - 1 === currentTab}
          />
        </>
      ) : (
        <Skeleton height={140} />
      )}
    </Container>
  );
};

export default VotingHistory;
