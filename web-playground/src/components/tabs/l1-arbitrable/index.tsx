import React, { useState } from "react";
import styled from "styled-components";
import { utils } from "ethers";
import { Button } from "@kleros/ui-components-library";
import Question from "./question";
import Options from "./options";
import Jurors from "./jurors";
import Subcourt from "./subcourt";
import { useContractFunction } from "../../../hooks/useContractFunction";
import { useContractCall } from "../../../hooks/useContractCall";

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

const createExtraData = (jurors: number, subcourt: number) => {
  const hexJurors = utils.hexZeroPad(utils.hexValue(jurors), 32);
  const hexSubcourt = utils.hexZeroPad(utils.hexValue(subcourt), 32);
  return utils.hexConcat([hexJurors, hexSubcourt]);
};

const L1Arbitrable = () => {
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [jurors, setJurors] = useState(2);
  const [subcourt, setSubcourt] = useState(0);
  const { send, state } = useContractFunction(
    "ForeignGateway",
    "createDispute"
  );
  const { call } = useContractCall("ForeignGateway", "arbitrationCost") || {};
  return (
    <Wrapper>
      <StyledContent>
        <Question />
        <Options {...{ options, setOptions }} />
        <Jurors
          defaultValue={jurors}
          callback={(value: number) => setJurors(value)}
        />
        <Subcourt
          defaultValue={subcourt}
          callback={(value: number) => setSubcourt(value)}
        />
        <StyledButton
          text={"Create Dispute"}
          onClick={async () => {
            const extradata = createExtraData(jurors, subcourt);
            call(extradata).then(async (value: any[]) => {
              const arbitrationCost = value.toString();
              send(options.length, extradata, {
                value: arbitrationCost,
              }).catch((error) => console.error(error));
            });
          }}
        />
      </StyledContent>
    </Wrapper>
  );
};

export default L1Arbitrable;
