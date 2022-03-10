import React, { useState } from "react";
import styled from "styled-components";
import DisputeSelector from "./dispute";
import Evidence from "./evidence";
import EvidencesTable from "./evidences-table";
import SubmitEvidenceButton from "./submit-evidence";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 64px;
  display: flex;
  justify-content: center;
  overflow: auto;
`;

const StyledContent = styled.div`
  width: 50%;
  height: fit-content;
  padding-top: 64px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
`;

const StyledButton = styled(SubmitEvidenceButton)`
  align-self: center;
`;

const Witness: React.FC = () => {
  const [selectedDispute, setSelectedDispute] = useState<string>();
  const [evidence, setEvidence] = useState<string>("");
  return (
    <Wrapper>
      <StyledContent>
        <DisputeSelector {...{ setSelectedDispute }} />
        <Evidence {...{ setEvidence }} />
        <EvidencesTable disputeID={selectedDispute} />
        <StyledButton disputeID={selectedDispute} text={evidence} />
      </StyledContent>
    </Wrapper>
  );
};

export default Witness;
