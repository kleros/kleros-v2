import React, { useState } from "react";
import styled from "styled-components";
import { Rinkeby } from "@usedapp/core";
import { utils } from "ethers";
import { Button } from "@kleros/ui-components-library";
import Question from "components/question";
import Options from "./options";
import Jurors from "./jurors";
import Subcourt from "./subcourt";
import { useContractFunction } from "hooks/useContractFunction";
import { useContractCall } from "hooks/useContractCall";
import DisputesTable from "./disputes";
import { useArbitrableExampleRuledDisputeQuery } from "queries/useArbitrableExampleQuery";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 64px;
  display: flex;
  justify-content: space-evenly;
  overflow: auto;
`;

const StyledButton = styled(Button)``;

const StyledContent = styled.div`
  width: auto;
  height: fit-content;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
  ${StyledButton} {
    align-self: center;
  }
`;

const createExtraData = (jurors: number, subcourt: number) => {
  const padding = utils.hexZeroPad(utils.hexValue(0), 32);
  const hexJurors = utils.hexZeroPad(utils.hexValue(jurors), 32);
  const hexSubcourt = utils.hexZeroPad(utils.hexValue(subcourt), 32);
  return utils.hexConcat([padding, hexJurors, hexSubcourt]);
};

const L1Arbitrable = () => {
  const options = ["Alice", "Bob", "Charlie"];
  const [jurors, setJurors] = useState(2);
  const [subcourt, setSubcourt] = useState(0);
  const { sendWithSwitch, send, state } = useContractFunction(
    "ArbitrableExample",
    "createDispute",
    {
      chainId: Rinkeby.chainId,
      transactionName: "l1-arbitrable-transaction",
    }
  );
  const { call } =
    useContractCall("ForeignGateway", "arbitrationCost", Rinkeby.chainId) || {};
  const { data, isLoading } = useArbitrableExampleRuledDisputeQuery();
  return (
    <Wrapper>
      <StyledContent>
        <Question question={"Who is right?"} />
        <Options {...{ options }} />
        <Jurors
          defaultValue={jurors}
          callback={(value: number) => setJurors(value)}
        />
        <Subcourt
          defaultValue={subcourt}
          callback={(value: number) => setSubcourt(value)}
        />
        {sendWithSwitch({
          text: "Create Dispute",
          disabled:
            isLoading || !["None", "Exception", "Fail"].includes(state.status),
          onClick: async () => {
            const extradata = createExtraData(jurors, subcourt);
            call &&
              data &&
              call(extradata).then(async (value: any[]) => {
                const arbitrationCost = value.toString();
                send(options.length, extradata, data.length, {
                  value: arbitrationCost,
                });
              });
          },
          className: StyledButton.styledComponentId,
        })}
        <DisputesTable {...{ data }} />
      </StyledContent>
    </Wrapper>
  );
};

export default L1Arbitrable;
