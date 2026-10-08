import React, { useCallback, useMemo, useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useDebounce } from "react-use";
import { Address, Hash } from "viem";

import { Button } from "@kleros/ui-components-library";

import DownArrow from "svgs/icons/arrow-down.svg";

import { useSpamEvidence } from "hooks/useSpamEvidence";

import { useEvidences } from "queries/useEvidences";
import { usePopulatedDisputeData } from "queries/usePopulatedDisputeData";

import { isUndefined } from "src/utils";

import { Divider } from "components/Divider";
import EvidenceCard from "components/EvidenceCard";
import { SkeletonEvidenceCard } from "components/StyledSkeleton";

import EvidenceSearch from "./EvidenceSearch";

interface IEvidence {
  arbitrable?: Address;
}
const Evidence: React.FC<IEvidence> = ({ arbitrable }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const ref = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState<string>();
  const [debouncedSearch, setDebouncedSearch] = useState<string>();
  const [showSpam, setShowSpam] = useState(false);
  const { data: spamEvidences } = useSpamEvidence(id!);
  const { data: disputeData } = usePopulatedDisputeData(id, arbitrable);
  const { data } = useEvidences(id!, debouncedSearch);

  useDebounce(() => setDebouncedSearch(search), 500, [search]);

  const scrollToLatest = useCallback(() => {
    if (!ref.current) return;
    const latestEvidence = ref.current.lastElementChild;

    if (!latestEvidence) return;

    latestEvidence.scrollIntoView({ behavior: "smooth" });
  }, [ref]);

  const isSpam = useCallback(
    (evidenceId: string) => {
      return Boolean(spamEvidences?.courtv2EvidenceSpamsByGroupId.evidenceIds?.includes(evidenceId));
    },
    [spamEvidences]
  );

  const arbitrableEvidences = disputeData?.extraEvidences;
  const evidences = useMemo(() => {
    if (!data?.evidences) return;
    const spamEvidences = data.evidences.filter((evidence) => isSpam(evidence.id));
    const realEvidences = data.evidences.filter((evidence) => !isSpam(evidence.id));
    return { realEvidences, spamEvidences };
  }, [data, isSpam]);

  return (
    <div ref={ref} className="w-full flex flex-col gap-4 items-center p-[20px_16px_16px] lg:p-8">
      <EvidenceSearch {...{ search, setSearch }} />
      <Button
        small
        Icon={DownArrow}
        text={t("buttons.scroll_to_latest")}
        onPress={scrollToLatest}
        className="self-end bg-transparent p-0 flex-row-reverse gap-2 [&_.button-text]:text-klerosUIComponentsPrimaryBlue [&_.button-text]:font-normal [&_.button-svg]:m-0 [&_.button-svg_path]:fill-klerosUIComponentsPrimaryBlue [&:hover]:bg-transparent [&:hover_.button-svg_path]:fill-klerosUIComponentsSecondaryBlue [&:hover_.button-text]:text-klerosUIComponentsSecondaryBlue"
      />
      {!isUndefined(arbitrableEvidences) && arbitrableEvidences.length > 0 ? (
        <>
          {arbitrableEvidences.map(({ name, description, fileURI, sender, timestamp, transactionHash }, index) => (
            <EvidenceCard
              key={index}
              evidence=""
              {...{
                sender,
                timestamp: isUndefined(timestamp) ? undefined : timestamp.toString(),
                transactionHash: isUndefined(transactionHash) ? undefined : (transactionHash as Hash),
                name,
                description,
                fileURI,
              }}
            />
          ))}
        </>
      ) : null}
      {evidences?.realEvidences ? (
        <>
          {evidences?.realEvidences.map(
            ({ evidence, sender, timestamp, transactionHash, name, description, fileURI, evidenceIndex }) => (
              <EvidenceCard
                key={timestamp}
                index={parseInt(evidenceIndex)}
                sender={sender?.id}
                {...{ evidence, timestamp, transactionHash, name, description, fileURI }}
              />
            )
          )}
          {spamEvidences && evidences?.spamEvidences.length !== 0 ? (
            <>
              <Divider />
              {showSpam ? (
                <>
                  <label
                    onClick={() => setShowSpam(false)}
                    className="text-klerosUIComponentsPrimaryBlue self-center cursor-pointer"
                  >
                    {t("evidence.hide_spam")}
                  </label>
                  {evidences?.spamEvidences.map(
                    ({ evidence, sender, timestamp, transactionHash, name, description, fileURI, evidenceIndex }) => (
                      <EvidenceCard
                        key={timestamp}
                        index={parseInt(evidenceIndex)}
                        sender={sender?.id}
                        {...{ evidence, timestamp, transactionHash, name, description, fileURI }}
                      />
                    )
                  )}
                </>
              ) : (
                <label
                  onClick={() => setShowSpam(true)}
                  className="text-klerosUIComponentsPrimaryBlue self-center cursor-pointer"
                >
                  {t("evidence.show_likely_spam")}
                </label>
              )}
            </>
          ) : null}
        </>
      ) : (
        <SkeletonEvidenceCard />
      )}

      {data && data.evidences.length === 0 ? (
        <label className="flex mt-4 text-[16px]">{t("evidence.no_evidence_yet")}</label>
      ) : null}
    </div>
  );
};

export default Evidence;
