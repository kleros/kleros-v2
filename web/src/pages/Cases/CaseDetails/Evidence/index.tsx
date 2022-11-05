import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useWeb3 } from "hooks/useWeb3";
import { Button, Searchbar } from "@kleros/ui-components-library";
import { useEvidenceGroup } from "queries/useEvidenceGroup";
import { useEvidences } from "queries/useEvidences";
import SubmitEvidenceModal from "./SubmitEvidenceModal";
import EvidenceCard from "components/EvidenceCard";

const Evidence: React.FC<{ arbitrable: string }> = ({ arbitrable }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { id } = useParams();
  const { data: evidenceGroup } = useEvidenceGroup(id, arbitrable);
  const { data } = useEvidences(evidenceGroup);
  const { account } = useWeb3();
  return (
    <Container>
      {evidenceGroup && (
        <SubmitEvidenceModal
          isOpen={isModalOpen}
          close={() => setIsModalOpen(false)}
          {...{ evidenceGroup }}
        />
      )}
      <Searchbar />
      <StyledButton
        small
        text="Submit Evidence"
        disabled={typeof account === "undefined" || isModalOpen}
        isLoading={isModalOpen}
        onClick={() => setIsModalOpen(true)}
      />
      {data &&
        data.evidences.map(({ evidence, sender }, i) => (
          <EvidenceCard key={i} index={i + 1} {...{ evidence, sender }} />
        ))}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  align-items: center;
`;

const StyledButton = styled(Button)`
  align-self: flex-end;
`;

export default Evidence;
