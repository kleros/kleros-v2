import React, { useState } from "react";
import styled from "styled-components";
import { useEthers, ArbitrumRinkeby } from "@usedapp/core";
import { BigNumber } from "ethers";
import { Button } from "@kleros/ui-components-library";
import DisputeID from "components/dispute-id";
import Question from "components/question";
import Answers from "components/answers";
import { useKlerosCoreDrawsQuery } from "queries/useKlerosCoreDrawsQuery";
import { useKlerosCoreDisputesMappingQuery } from "queries/useKlerosCoreDisputesQuery";
import { useContractFunction } from "hooks/useContractFunction";
import { PERIODS } from "./kleros-core/disputes-table";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 64px;
  display: flex;
  justify-content: center;
  overflow: auto;
`;

const StyledButton = styled(Button)``;

const StyledContent = styled.div`
  width: 50%;
  height: fit-content;
  padding-top: 64px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
  ${StyledButton} {
    align-self: center;
  }
`;

const options = [
  {
    label: "Alice",
    value: 1,
  },
  {
    label: "Bob",
    value: 2,
  },
  {
    label: "Charlie",
    value: 3,
  },
];

type JurorDisputes = {
  [disputeID: string]: { voteIDs: BigNumber[] };
};

const Juror: React.FC = () => {
  const { account } = useEthers();
  const [dispute, setDispute] = useState<string>();
  const [answer, setAnswer] = useState<number>();
  const { sendWithSwitch, send, state } = useContractFunction(
    "DisputeKitClassic",
    "castVote",
    {
      chainId: ArbitrumRinkeby.chainId,
    }
  );
  const { data } = useKlerosCoreDrawsQuery();
  const disputes = useKlerosCoreDisputesMappingQuery();
  const filteredDraws =
    (disputes &&
      data?.filter(
        (draw) =>
          disputes[draw.disputeID.toString()].period === PERIODS.vote &&
          draw.address === account?.toString()
      )) ||
    [];
  const jurorDisputes: JurorDisputes = {};
  for (const draw of filteredDraws) {
    const disputeID = draw.disputeID.toString();
    const dispute = jurorDisputes[disputeID];
    if (!dispute) jurorDisputes[disputeID] = { voteIDs: [] };
    jurorDisputes[disputeID].voteIDs.push(draw.voteID);
  }
  const dropdownOptions = Object.keys(jurorDisputes).map((dispute) => ({
    text: dispute,
    value: dispute,
  }));
  return (
    <Wrapper>
      <StyledContent>
        <DisputeID
          items={dropdownOptions ?? []}
          callback={(disputeID: string) => setDispute(disputeID)}
        />
        <Question question={"Who is right?"} />
        <Answers
          {...{ options }}
          callback={(value: number) => {
            setAnswer(value);
          }}
        />
        {sendWithSwitch({
          className: StyledButton.styledComponentId,
          text: "Cast Vote",
          disabled:
            !dispute ||
            !answer ||
            !["None", "Exception", "Fail"].includes(state.status),
          onClick: () =>
            dispute &&
            send(dispute, jurorDisputes[dispute].voteIDs, answer, "0"),
        })}
      </StyledContent>
    </Wrapper>
  );
};

export default Juror;
