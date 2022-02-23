import React, { useState } from "react";
import styled from "styled-components";
import { useEthers, ArbitrumRinkeby } from "@usedapp/core";
import { BigNumber } from "ethers";
import { Button } from "@kleros/ui-components-library";
import DisputeID from "components/dispute-id";
import Question from "components/question";
import Answers from "components/answers";
import { useKlerosCoreDrawsQuery } from "queries/useKlerosCoreDrawsQuery";
import { useContractFunction } from "hooks/useContractFunction";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 64px;
  display: flex;
  justify-content: center;
`;

const StyledContent = styled.div`
  width: 50%;
  height: 100%;
  padding-top: 64px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
`;

const StyledButton = styled(Button)`
  align-self: center;
`;

const options = [
  {
    label: "Alice",
    value: 0,
  },
  {
    label: "Bob",
    value: 1,
  },
  {
    label: "Charlie",
    value: 2,
  },
];

interface IJurorDispute {
  text: string;
  value: { disputeID: BigNumber; voteIDs: BigNumber[] };
}

const Juror: React.FC = () => {
  const { account } = useEthers();
  const [draw, setDraw] = useState<IJurorDispute["value"]>();
  const [answer, setAnswer] = useState<number>();
  const { sendWithSwitch, state } = useContractFunction(
    "KlerosCore",
    "castVote",
    {
      chainId: ArbitrumRinkeby.chainId,
    }
  );
  const { data } = useKlerosCoreDrawsQuery();
  const filteredDraws =
    data?.filter((draw) => draw.address === account?.toString()) || [];
  const jurorDisputes: IJurorDispute[] = [];
  for (const draw of filteredDraws) {
    const disputeIndex = jurorDisputes.findIndex(
      (dispute: IJurorDispute) => dispute.text === draw.disputeID.toString()
    );
    if (disputeIndex > -1)
      jurorDisputes[disputeIndex].value.voteIDs.push(draw.voteID);
    else
      jurorDisputes.push({
        text: draw.disputeID.toString(),
        value: { disputeID: draw.disputeID, voteIDs: [draw.voteID] },
      });
  }
  return (
    <Wrapper>
      <StyledContent>
        <DisputeID
          items={jurorDisputes ?? []}
          callback={(draw: IJurorDispute["value"]) => setDraw(draw)}
        />
        <Question question={"Who is right?"} />
        <Answers
          {...{ options }}
          callback={(value: number) => {
            setAnswer(value);
          }}
        />
        <StyledButton
          text="Cast Vote"
          disabled={![""].includes(state.status)}
          onClick={() =>
            sendWithSwitch(draw?.disputeID, draw?.voteIDs, answer, "")
          }
        />
      </StyledContent>
    </Wrapper>
  );
};

export default Juror;
