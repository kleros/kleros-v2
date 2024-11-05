import React, { useCallback, useRef, useState } from "react";
import styled from "styled-components";

import { useParams } from "react-router-dom";
import { useDebounce } from "react-use";

import { Button } from "@kleros/ui-components-library";

import DownArrow from "svgs/icons/arrow-down.svg";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { useEvidences } from "queries/useEvidences";

import { responsiveSize } from "styles/responsiveSize";

import EvidenceCard from "components/EvidenceCard";
import { SkeletonEvidenceCard } from "components/StyledSkeleton";

import EvidenceSearch from "./EvidenceSearch";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;

  align-items: center;
  padding: ${responsiveSize(16, 32)};
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
  margin: 0 0 18px;
  gap: 8px;
  .button-text {
    color: ${({ theme }) => theme.primaryBlue};
    font-weight: 400;
  }
  .button-svg {
    margin: 0;
  }
  :focus,
  :hover {
    background-color: transparent;
  }
`;

const Evidence: React.FC = () => {
  const { id } = useParams();
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const ref = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState<string>();
  const [debouncedSearch, setDebouncedSearch] = useState<string>();

  const { data } = useEvidences(disputeData?.dispute?.externalDisputeId?.toString(), debouncedSearch);

  useDebounce(() => setDebouncedSearch(search), 500, [search]);

  const scrollToLatest = useCallback(() => {
    if (!ref.current) return;
    const latestEvidence = ref.current.lastElementChild;

    if (!latestEvidence) return;

    latestEvidence.scrollIntoView({ behavior: "smooth" });
  }, [ref]);

  return (
    <Container ref={ref}>
      <EvidenceSearch {...{ search, setSearch, evidenceGroup: disputeData?.dispute?.externalDisputeId }} />
      <ScrollButton small Icon={DownArrow} text="Scroll to latest" onClick={scrollToLatest} />
      {data ? (
        data.evidences.map(({ evidence, sender, timestamp, name, description, fileURI, evidenceIndex }) => (
          <EvidenceCard
            key={timestamp}
            index={parseInt(evidenceIndex)}
            sender={sender?.id}
            {...{ evidence, timestamp, name, description, fileURI }}
          />
        ))
      ) : (
        <SkeletonEvidenceCard />
      )}
      {data && data.evidences.length === 0 ? <StyledLabel>There is no evidence submitted yet</StyledLabel> : null}
    </Container>
  );
};

export default Evidence;
