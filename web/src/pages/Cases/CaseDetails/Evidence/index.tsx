import React, { useCallback, useMemo, useRef, useState } from "react";
import styled, { css } from "styled-components";

import { useParams } from "react-router-dom";
import { useDebounce } from "react-use";
import { Address } from "viem";

import { Button } from "@kleros/ui-components-library";

import DownArrow from "svgs/icons/arrow-down.svg";

import { useSpamEvidence } from "hooks/useSpamEvidence";

import { useEvidences } from "queries/useEvidences";
import { usePopulatedDisputeData } from "queries/usePopulatedDisputeData";

import { isUndefined } from "src/utils";

import { landscapeStyle } from "styles/landscapeStyle";

import { Divider } from "components/Divider";
import EvidenceCard from "components/EvidenceCard";
import { SkeletonEvidenceCard } from "components/StyledSkeleton";
import WithHelpTooltip from "components/WithHelpTooltip";

import EvidenceSearch from "./EvidenceSearch";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px 16px;

  ${landscapeStyle(
    () => css`
      padding: 32px;
    `
  )}
`;
const EvidenceContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 24px;
  margin-top: 32px;
`;

const JustificationContainer = styled(EvidenceContainer)`
  margin-top: 0px;
  margin-bottom: 32px;
`;

const EvidenceHeading = styled.h2`
  font-size: 24px;
  color: ${({ theme }) => theme.primaryText};
  font-weight: 600;
  margin-bottom: 0;
`;

const EvidenceCardContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StyledLabel = styled.label`
  display: flex;
  font-size: 16px;
`;

const ArbitrableEvidenceHeading = styled.label`
  font-size: 16px;
  color: ${({ theme }) => theme.primaryText};
`;

const ScrollButton = styled(Button)`
  align-self: flex-end;
  background-color: transparent;
  padding: 0;
  flex-direction: row-reverse;
  gap: 8px;
  margin-top: 18px;
  margin-bottom: 24px;
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

interface IEvidence {
  arbitrable?: Address;
}
const Evidence: React.FC<IEvidence> = ({ arbitrable }) => {
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
    <Container ref={ref}>
      <EvidenceSearch {...{ search, setSearch }} />
      <ScrollButton small Icon={DownArrow} text="Scroll to latest" onClick={scrollToLatest} />
      {!isUndefined(arbitrableEvidences) && arbitrableEvidences.length > 0 ? (
        <>
          <JustificationContainer>
            <WithHelpTooltip tooltipMsg="Justifications are submitted by one party before the case is created and explain their initial position or reasons for initiating the dispute.">
              <ArbitrableEvidenceHeading>Justifications</ArbitrableEvidenceHeading>
            </WithHelpTooltip>
            <EvidenceCardContainer>
              {arbitrableEvidences.map(({ name, description, fileURI, sender, timestamp, transactionHash }, index) => (
                <EvidenceCard
                  key={index}
                  evidence=""
                  {...{ sender, timestamp, transactionHash, name, description, fileURI }}
                />
              ))}
            </EvidenceCardContainer>
          </JustificationContainer>
        </>
      ) : null}
      <Divider />

      {evidences?.realEvidences ? (
        <EvidenceContainer>
          <EvidenceHeading>Evidence</EvidenceHeading>
          {data?.evidences.length !== 0 ? (
            <EvidenceCardContainer>
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
                        ({
                          evidence,
                          sender,
                          timestamp,
                          transactionHash,
                          name,
                          description,
                          fileURI,
                          evidenceIndex,
                        }) => (
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
            </EvidenceCardContainer>
          ) : (
            <StyledLabel>There is no evidence submitted yet</StyledLabel>
          )}
        </EvidenceContainer>
      ) : (
        <SkeletonEvidenceCard />
      )}
    </Container>
  );
};

export default Evidence;
