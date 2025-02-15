import React, { useCallback, useMemo, useRef, useState } from "react";
import styled, { css } from "styled-components";

import { useParams } from "react-router-dom";
import { useDebounce } from "react-use";

import { Button } from "@kleros/ui-components-library";

import DownArrow from "svgs/icons/arrow-down.svg";

import { useSpamEvidence } from "hooks/useSpamEvidence";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { useEvidences } from "queries/useEvidences";

import { landscapeStyle } from "styles/landscapeStyle";

import { Divider } from "components/Divider";
import EvidenceCard from "components/EvidenceCard";
import { SkeletonEvidenceCard } from "components/StyledSkeleton";

import EvidenceSearch from "./EvidenceSearch";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  padding: 20px 16px 16px;

  ${landscapeStyle(
    () => css`
      padding: 32px;
    `
  )}
`;

const StyledLabel = styled.label`
  display: flex;
  margin-top: 16px;
  font-size: 16px;
`;

const ScrollButton = styled(Button)`
  align-self: flex-end;
  background-color: transparent;
  padding: 0;
  flex-direction: row-reverse;
  gap: 8px;
  .button-text {
    color: ${({ theme }) => theme.primaryBlue};
    font-weight: 400;
  }
  .button-svg {
    margin: 0;
    path {
      fill: ${({ theme }) => theme.primaryBlue};
    }
  }

  :hover {
    background-color: transparent;
    .button-svg {
      path {
        fill: ${({ theme }) => theme.secondaryBlue};
      }
    }
    .button-text {
      color: ${({ theme }) => theme.secondaryBlue};
    }
  }
`;

const SpamLabel = styled.label`
  color: ${({ theme }) => theme.primaryBlue};
  align-self: center;
  cursor: pointer;
`;

const Evidence: React.FC = () => {
  const { id } = useParams();
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const ref = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState<string>();
  const [debouncedSearch, setDebouncedSearch] = useState<string>();
  const [showSpam, setShowSpam] = useState(false);
  const { data: spamEvidences } = useSpamEvidence(disputeData?.dispute?.externalDisputeId?.toString());

  const { data } = useEvidences(disputeData?.dispute?.externalDisputeId?.toString(), debouncedSearch);

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

  const evidences = useMemo(() => {
    if (!data?.evidences) return;
    const spamEvidences = data.evidences.filter((evidence) => isSpam(evidence.id));
    const realEvidences = data.evidences.filter((evidence) => !isSpam(evidence.id));
    return { realEvidences, spamEvidences };
  }, [data, isSpam]);

  return (
    <Container ref={ref}>
      <EvidenceSearch {...{ search, setSearch, evidenceGroup: disputeData?.dispute?.externalDisputeId }} />
      <ScrollButton small Icon={DownArrow} text="Scroll to latest" onClick={scrollToLatest} />
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
                  <SpamLabel onClick={() => setShowSpam(false)}>Hide spam</SpamLabel>
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
                <SpamLabel onClick={() => setShowSpam(true)}>Show likely spam</SpamLabel>
              )}
            </>
          ) : null}
        </>
      ) : (
        <SkeletonEvidenceCard />
      )}

      {data && data.evidences.length === 0 ? <StyledLabel>There is no evidence submitted yet</StyledLabel> : null}
    </Container>
  );
};

export default Evidence;
