import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { Button, Searchbar } from "@kleros/ui-components-library";
import { useEvidenceGroup } from "queries/useEvidenceGroup";
import { useEvidences } from "queries/useEvidences";
import SubmitEvidenceModal from "./SubmitEvidenceModal";
import { SkeletonEvidenceCard } from "components/StyledSkeleton";
import EvidenceCard from "components/EvidenceCard";
import { EnsureChain } from "components/EnsureChain";
import { isUndefined } from "utils/index";
import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;

  align-items: center;
  padding: ${responsiveSize(16, 32)};
`;

const StyledButton = styled(Button)`
  align-self: flex-end;
`;

const StyledLabel = styled.label`
  display: flex;
  margin-top: 16px;
  font-size: 16px;
`;

const Evidence: React.FC<{ arbitrable?: `0x${string}` }> = ({ arbitrable }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { id } = useParams();
  const { data: evidenceGroup } = useEvidenceGroup(id, arbitrable);
  const { data } = useEvidences(evidenceGroup?.toString());
  const { address } = useAccount();

  return (
    <Container>
      {!isUndefined(evidenceGroup) && (
        <SubmitEvidenceModal isOpen={isModalOpen} close={() => setIsModalOpen(false)} {...{ evidenceGroup }} />
      )}
      <Searchbar />
      <EnsureChain>
        <StyledButton
          small
          text="Submit Evidence"
          disabled={typeof address === "undefined" || isModalOpen}
          isLoading={isModalOpen}
          onClick={() => setIsModalOpen(true)}
        />
      </EnsureChain>
      {data ? (
        data.evidences.map(({ key, evidence, sender }, i) => (
          <EvidenceCard key={key} index={i + 1} sender={sender?.id} {...{ evidence }} />
        ))
      ) : (
        <SkeletonEvidenceCard />
      )}
      {data && data.evidences.length === 0 ? <StyledLabel>There is no evidence submitted yet</StyledLabel> : null}
    </Container>
  );
};

export default Evidence;
