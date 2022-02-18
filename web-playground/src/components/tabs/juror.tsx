import React, { useState } from "react";
import styled from "styled-components";
import { useEthers, ArbitrumRinkeby } from "@usedapp/core";
import { Button } from "@kleros/ui-components-library";
import DisputeID from "components/dispute-id";
import Question from "components/question";
import Answers from "components/answers";
import {
  useKlerosCoreDrawsQuery,
  IKlerosCoreDraw,
} from "queries/useKlerosCoreDrawsQuery";
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

const Juror: React.FC = () => {
  const { account } = useEthers();
  const [draw, setDraw] = useState<IKlerosCoreDraw>();
  const [answer, setAnswer] = useState<number>();
  const { sendWithSwitch, state } = useContractFunction(
    "KlerosCore",
    "castVote",
    {
      chainId: ArbitrumRinkeby.chainId,
    }
  );
  const { data } = useKlerosCoreDrawsQuery();
  const filteredDisputeIDs = data
    ?.filter((draw) => draw.address === account?.toString())
    .map((draw) => ({
      text: draw.disputeID.toString(),
      value: draw,
    }));
  return (
    <Wrapper>
      <StyledContent>
        <DisputeID
          items={filteredDisputeIDs ?? []}
          callback={(draw: IKlerosCoreDraw) => setDraw(draw)}
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
            sendWithSwitch(draw?.disputeID, draw?.voteID, answer, answer)
          }
        />
      </StyledContent>
    </Wrapper>
  );
};

export default Juror;
