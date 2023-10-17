import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { Button, Searchbar } from "@kleros/ui-components-library";
import { useEvidenceGroup } from "queries/useEvidenceGroup";
import { useEvidences } from "queries/useEvidences";
import SubmitEvidenceModal from "./SubmitEvidenceModal";
import EvidenceCard from "components/EvidenceCard";
import { EnsureChain } from "components/EnsureChain";
import { isUndefined } from "utils/index";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;

  align-items: center;
  padding: calc(16px + (32 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
`;

const StyledButton = styled(Button)`
  align-self: flex-end;
`;

const Evidence: React.FC<{ arbitrable?: `0x${string}` }> = ({ arbitrable }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { id } = useParams();
  const { data: evidenceGroup } = useEvidenceGroup(id, arbitrable);
  const { data } = useEvidences(evidenceGroup?.toString());
  const { address } = useAccount();

  return (
    <Container>
      <>
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
        {data &&
          data.evidences.map(({ key, evidence, sender }, i) => (
            <EvidenceCard key={key} index={i + 1} sender={sender?.id} {...{ evidence }} />
          ))}
      </>
    </Container>
  );
};

export default Evidence;
