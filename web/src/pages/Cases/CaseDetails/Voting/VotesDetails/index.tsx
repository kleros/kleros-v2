import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";
import { Hash } from "viem";

import { Card, CustomAccordion } from "@kleros/ui-components-library";

import { Answer } from "context/NewDisputeContext";
import { formatDate } from "utils/date";
import { DrawnJuror } from "utils/getDrawnJurorsWithCount";
import { getVoteChoice } from "utils/getVoteChoice";
import { getTxnExplorerLink, isUndefined } from "utils/index";

import { ExternalLink } from "components/ExternalLink";
import InfoCard from "components/InfoCard";
import MarkdownRenderer from "components/MarkdownRenderer";

import AccordionTitle from "./AccordionTitle";

const AccordionContent: React.FC<{
  choice?: string;
  answers: Answer[];
  justification: string;
  timestamp?: string;
  transactionHash?: Hash;
}> = ({ justification, choice, answers, timestamp, transactionHash }) => {
  const { t, i18n } = useTranslation();
  const transactionExplorerLink = useMemo(() => {
    if (isUndefined(transactionHash)) return undefined;
    return getTxnExplorerLink(transactionHash);
  }, [transactionHash]);

  return (
    <div className="flex flex-col gap-3">
      {!isUndefined(choice) && (
        <label dir="auto" className="text-klerosUIComponentsSecondaryText text-[16px]">
          <span className="text-klerosUIComponentsPrimaryText mr-1">{t("misc.voted")}</span>
          {getVoteChoice(choice, answers)}
        </label>
      )}

      {justification ? (
        <div dir="auto" className="leading-[1.25]">
          <span className="text-klerosUIComponentsPrimaryText text-[16px] mr-1">{t("misc.justification")}</span>
          <MarkdownRenderer content={justification} />
        </div>
      ) : (
        <label className="text-klerosUIComponentsSecondaryText text-[16px] flex-1">
          {t("voting.no_justification_provided")}
        </label>
      )}
      {!isUndefined(timestamp) && !isUndefined(transactionExplorerLink) && (
        <ExternalLink to={transactionExplorerLink} rel="noopener noreferrer" target="_blank">
          {formatDate(Number(timestamp), true, i18n.language)}
        </ExternalLink>
      )}
    </div>
  );
};

interface IVotesAccordion {
  drawnJurors: DrawnJuror[];
  period: string;
  answers: Answer[];
  isActiveRound: boolean;
  hiddenVotes: boolean;
}

//Current ui-components-library version declares two AccordionItem types.
//TypeScript resolves to the narrower type, so we get type errors here.
//Updating to the latest version of the library should allows to simplify this.
type CustomAccordionItem = React.ComponentProps<typeof CustomAccordion>["items"][number];

const VotesAccordion: React.FC<IVotesAccordion> = ({ drawnJurors, period, answers, isActiveRound, hiddenVotes }) => {
  const { t } = useTranslation();
  const accordionItems = useMemo(() => {
    return drawnJurors
      .map((drawnJuror) =>
        !isUndefined(drawnJuror.vote?.justification?.choice)
          ? {
              title: (
                <AccordionTitle
                  juror={drawnJuror.juror.id}
                  voteCount={drawnJuror.voteCount}
                  choice={drawnJuror.vote?.justification?.choice}
                  period={period}
                  answers={answers}
                  isActiveRound={isActiveRound}
                  commited={Boolean(drawnJuror.vote.commited)}
                  hiddenVotes={hiddenVotes}
                />
              ),
              body: (
                <AccordionContent
                  justification={drawnJuror?.vote?.justification.reference ?? ""}
                  choice={drawnJuror.vote?.justification?.choice}
                  answers={answers}
                  transactionHash={drawnJuror.transactionHash}
                  timestamp={drawnJuror.timestamp}
                />
              ),
            }
          : null
      )
      .filter((item) => item !== null);
  }, [drawnJurors, period, answers, isActiveRound, hiddenVotes]);

  return (
    <>
      {drawnJurors.length === 0 ? <InfoCard msg={t("alerts.jurors_not_drawn_yet")} className="mt-[18.5px]" /> : null}
      <div className="flex flex-col">
        {accordionItems.length > 0 ? (
          <CustomAccordion
            items={accordionItems as unknown as CustomAccordionItem[]}
            className={
              'w-full max-w-[none] [&_>_div]:m-[4px_0] [&_[id="expand-button"]]:p-4! [&_[id="body-wrapper"]]:p-[12px_8px_8px]! lg:[&_[id="expand-button"]]:p-[12px_16px]! lg:[&_[id="body-wrapper"]]:p-[12px_16px_8px]!'
            }
          />
        ) : null}
        {drawnJurors.map(
          (drawnJuror) =>
            isUndefined(drawnJuror.vote?.justification?.choice) && (
              <Card
                key={drawnJuror.juror.id}
                className="[transition:0.1s] w-full h-auto p-4 border border-solid border-klerosUIComponentsStroke m-[4px_0] [&:hover]:[background-color:color-mix(in_srgb,_var(--klerosUIComponentsLightGrey)_73.33333333333333%,_transparent)] lg:p-[12px_16px]"
              >
                <AccordionTitle
                  juror={drawnJuror.juror.id}
                  voteCount={drawnJuror.voteCount}
                  period={period}
                  answers={answers}
                  isActiveRound={isActiveRound}
                  hiddenVotes={hiddenVotes}
                  commited={Boolean(drawnJuror.vote?.commited)}
                />
              </Card>
            )
        )}
      </div>
    </>
  );
};

export default VotesAccordion;
