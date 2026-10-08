import React, { useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import { useParams } from "react-router-dom";
import { useToggle } from "react-use";
import { Address } from "viem";

import { Tabs } from "@kleros/ui-components-library";

import { getDrawnJurorsWithCount } from "utils/getDrawnJurorsWithCount";
import { getLocalRounds } from "utils/getLocalRounds";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { usePopulatedDisputeData } from "queries/usePopulatedDisputeData";
import { useVotingHistory } from "queries/useVotingHistory";

import HowItWorks from "components/HowItWorks";
import MarkdownRenderer from "components/MarkdownRenderer";
import BinaryVoting from "components/Popup/MiniGuides/BinaryVoting";

import PendingVotesBox from "./PendingVotesBox";
import VotesAccordion from "./VotesDetails";

const VotingHistory: React.FC<{ arbitrable?: Address; isQuestion: boolean }> = ({ arbitrable, isQuestion }) => {
  const { t } = useTranslation();
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

  const drawnJurors = useMemo(
    () => getDrawnJurorsWithCount(votingHistory?.dispute?.rounds[currentTab]?.drawnJurors ?? []),
    [votingHistory, currentTab]
  );

  const isHiddenVotes = Boolean(votingHistory?.dispute?.rounds[currentTab].hiddenVotes);
  return (
    <div className="flex flex-col gap-[calc(16px_+_(24_-_16)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
      <div className="flex flex-row flex-wrap items-center justify-between gap-4">
        <h1 className="mb-0 text-[calc(18px_+_(24_-_18)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
          {t("voting.voting_history")}
        </h1>
        <HowItWorks
          isMiniGuideOpen={isBinaryVotingMiniGuideOpen}
          toggleMiniGuide={toggleBinaryVotingMiniGuide}
          MiniGuideComponent={BinaryVoting}
        />
      </div>
      {rounds && localRounds && disputeDetails ? (
        <>
          {isQuestion && (
            <>
              {disputeDetails.question ? (
                <div dir="auto">
                  <MarkdownRenderer
                    content={disputeDetails.question}
                    className="max-w-[inherit] [word-wrap:break-word] [&_p]:m-0"
                  />
                </div>
              ) : (
                <MarkdownRenderer
                  content={isError ? t("errors.rpc_error") : t("errors.invalid_dispute_data")}
                  className="max-w-[inherit] [word-wrap:break-word] [&_p]:m-0"
                />
              )}
            </>
          )}
          <div className="flex flex-col">
            <Tabs
              selectedKey={currentTab}
              items={rounds.map((_, i) => ({
                id: i,
                text: t("voting.round_number", { number: i + 1 }),
                value: i,
                content: null,
              }))}
              callback={(_key, value) => setCurrentTab(value)}
              className={"tabs-selected-underline w-full"}
            />
            <PendingVotesBox
              current={Number(localRounds?.[currentTab]?.totalVoted)}
              total={Number(rounds[currentTab]?.nbVotes)}
              court={rounds[currentTab]?.court.name ?? ""}
            />
            <VotesAccordion
              drawnJurors={drawnJurors}
              period={disputeData?.dispute?.period ?? ""}
              answers={disputeDetails.answers}
              isActiveRound={localRounds?.length - 1 === currentTab}
              hiddenVotes={isHiddenVotes}
            />
          </div>
        </>
      ) : (
        <Skeleton height={140} />
      )}
    </div>
  );
};

export default VotingHistory;
