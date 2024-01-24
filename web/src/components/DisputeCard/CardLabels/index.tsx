import React from "react";
import styled from "styled-components";
import Label from "./Label";
import EvidenceIcon from "svgs/label-icons/evidence.svg";
import { useDisputeDetailsQuery } from "hooks/queries/useDisputeDetailsQuery";
import { useVotingHistory } from "hooks/queries/useVotingHistory";

const Container = styled.div`
  width: 100%;
  margin-top: 16px;
`;
interface ICardLabels {
  disputeId: string;
  round: string;
}

const CardLabel: React.FC<ICardLabels> = ({ disputeId, round }) => {
  const { data: disputeData } = useDisputeDetailsQuery(disputeId);
  const { data: votingHistory } = useVotingHistory(disputeId);
  return (
    <Container>
      {" "}
      <Label text="Evidence Time" icon={EvidenceIcon} color="blue" />
    </Container>
  );
};
export default CardLabel;
